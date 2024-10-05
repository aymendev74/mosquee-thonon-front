import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import qs from 'qs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';

type AuthContextType = {
    isAuthenticated: boolean;
    getLoggedUser: () => string;
    login: () => Promise<void>;
    logout: () => void;
    getAccessToken: () => string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

interface MyJwtPayload extends JwtPayload {
    roles: string[];
}

export function generateCodeVerifier(length: number) {
    const randomBytes = new Uint8Array(length);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}
export function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    return window.crypto.subtle.digest('SHA-256', data).then(hash => {
        // Convertir le Uint8Array en base64
        const base64String = btoa(String.fromCharCode(...Array.from(new Uint8Array(hash))))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        return base64String;
    });
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const redirectBaseURI = process.env.REACT_APP_OAUTH_REDIRECT_BASE_URI;
    const authorizationEndpoint = process.env.REACT_APP_OAUTH_AUTHORIZATION_ENDPOINT;
    const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    function getCustomizeRedirectUri() {
        return location.pathname !== "/login" ? redirectBaseURI + location.pathname : redirectBaseURI + "/admin";
    }

    const login = useCallback(async function () {
        try {
            const customizeRedirectUri = getCustomizeRedirectUri();
            const encodedRedirectUri = encodeURIComponent(customizeRedirectUri);
            console.log(customizeRedirectUri);
            const codeVerifier = generateCodeVerifier(128);
            const codeChallenge = await generateCodeChallenge(codeVerifier);
            const encodedCodeChallenge = encodeURIComponent(codeChallenge);
            sessionStorage.setItem("code_verifier", codeVerifier);
            sessionStorage.setItem("redirect_uri", customizeRedirectUri);
            const url = `${authorizationEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=ADMIN&code_challenge=${encodedCodeChallenge}&code_challenge_method=S256`;
            window.location.replace(url)
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
        }
    }, []);

    const logout = useCallback(() => {
        // TODO
    }, []);

    async function exchangeCodeForToken(code: string) {
        const codeVerifier = sessionStorage.getItem("code_verifier");
        const redirectURI = sessionStorage.getItem("redirect_uri");
        const response = await axios.post("http://localhost:8080/api/oauth2/token", qs.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectURI,
            client_id: clientId,
            code_verifier: codeVerifier
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });
        const decoded = jwtDecode<MyJwtPayload>(response.data.access_token);
        const tokenData = {
            accessToken: response.data.access_token,
            user: decoded.sub!,
            expirationTime: decoded.exp! * 1000 // après le decode de jwtDecode, l'expiration est en secondes
        }
        sessionStorage.setItem("tokenData", JSON.stringify(tokenData));
        setIsAuthenticated(true);
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
            exchangeCodeForToken(code);
        }
    }, []);

    const getAccessToken = useCallback(() => {
        const tokenData = sessionStorage.getItem("tokenData");
        if (tokenData) {
            const parsedTokenData = JSON.parse(tokenData);
            if (new Date().getTime() < parsedTokenData?.expirationTime) {
                console.log("token encore valide");
                return parsedTokenData.accessToken;
            } else {
                console.log("token expiré");
                login();
            }
        }
    }, []);

    const getLoggedUser = useCallback(() => {
        const tokenData = sessionStorage.getItem("tokenData");
        return tokenData ? JSON.parse(tokenData).user : null;
    }, []);

    return (
        <AuthContext.Provider value={{ getAccessToken, login, logout, getLoggedUser, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};