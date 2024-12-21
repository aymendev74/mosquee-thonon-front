import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import qs from 'qs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
    isAuthenticated: boolean;
    getLoggedUser: () => string;
    getRoles: () => string[];
    login: () => Promise<void>;
    logout: () => void;
    getAccessToken: () => string | null;
    getAccessTokenSilently: () => string;
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
    const redirectURI = process.env.REACT_APP_OAUTH_REDIRECT_URI;
    const authorizationEndpoint = process.env.REACT_APP_OAUTH_AUTHORIZATION_ENDPOINT;
    const tokenEndpoint = process.env.REACT_APP_OAUTH_TOKEN_ENDPOINT;
    const logoutEndpoint = process.env.REACT_APP_BASE_URL_API + "/logout";
    const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    function getState() {
        const currentPath = window.location.pathname;
        if (currentPath.endsWith("/login")) {
            return null;
        }
        return currentPath;
    }

    function tokenExpired(expirationTime: any) {
        return new Date().getTime() >= expirationTime;
    }

    const login = useCallback(async function () {
        try {
            const state = getState();
            const encodedRedirectUri = encodeURIComponent(redirectURI!);
            const codeVerifier = generateCodeVerifier(128);
            const codeChallenge = await generateCodeChallenge(codeVerifier);
            const encodedCodeChallenge = encodeURIComponent(codeChallenge);
            sessionStorage.setItem("code_verifier", codeVerifier);
            const url = `${authorizationEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&code_challenge=${encodedCodeChallenge}&code_challenge_method=S256`;
            const urlWithState = state ? `${url}&state=${state}` : url;
            window.location.replace(urlWithState);
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
        }
    }, []);

    const logout = useCallback(async () => {
        const tokenData = sessionStorage.getItem("tokenData");
        if (tokenData) {
            const parsedTokenData = JSON.parse(tokenData);
            if (parsedTokenData.accessToken && !tokenExpired(parsedTokenData.expirationTime)) {
                sessionStorage.removeItem("tokenData");
                window.location.replace(logoutEndpoint);
            }
        }
    }, []);

    async function exchangeCodeForToken(code: string) {
        const codeVerifier = sessionStorage.getItem("code_verifier");
        const response = await axios.post(tokenEndpoint!, qs.stringify({
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
            expirationTime: decoded.exp! * 1000, // après le decode de jwtDecode, l'expiration est en secondes
            roles: decoded.roles
        }
        sessionStorage.setItem("tokenData", JSON.stringify(tokenData));
        setIsAuthenticated(true);
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        if (code) {
            exchangeCodeForToken(code);
        } else if (state) {
            window.location.replace(state);
        } else if (getLoggedUser() != null) {
            setIsAuthenticated(true);
        }
    }, []);

    const getAccessToken = useCallback(() => {
        const tokenData = sessionStorage.getItem("tokenData");
        if (tokenData) {
            const parsedTokenData = JSON.parse(tokenData);
            if (!tokenExpired(parsedTokenData?.expirationTime)) {
                return parsedTokenData.accessToken;
            }
        }
        login();
        return null;
    }, []);

    const getAccessTokenSilently = useCallback(() => {
        const tokenData = sessionStorage.getItem("tokenData");
        if (tokenData) {
            const parsedTokenData = JSON.parse(tokenData);
            return parsedTokenData.accessToken;
        }
        return null;
    }, []);

    const getLoggedUser = useCallback(() => {
        const tokenData = sessionStorage.getItem("tokenData");
        return tokenData ? JSON.parse(tokenData).user : null;
    }, []);

    const getRoles = useCallback(() => {
        const tokenData = sessionStorage.getItem("tokenData");
        return tokenData ? JSON.parse(tokenData).roles : null;
    }, []);

    return (
        <AuthContext.Provider value={{ getAccessToken, getAccessTokenSilently, login, logout, getLoggedUser, getRoles, isAuthenticated }}>
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