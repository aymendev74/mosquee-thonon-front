import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import qs from 'qs';
import { jwtDecode, JwtPayload } from 'jwt-decode';

type AuthContextType = {
    loggedUser: string | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    login: () => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
}

const CLIENT_ID = "moth-react-app";

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
            .replace(/\+/g, '-') // Remplacer + par -
            .replace(/\//g, '_') // Remplacer / par _
            .replace(/=+$/, ''); // Enlever les caractères de remplissage

        return base64String;
    });
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [loggedUser, setLoggedUser] = useState<string | null>(null);
    const REDIRECT_URI = "http://localhost:3000/admin";

    const login = async () => {
        try {
            if (!accessToken) {
                const clientId = 'moth-react-app';
                const redirectUri = encodeURIComponent(REDIRECT_URI);
                const authorizationEndpoint = 'http://localhost:8080/api/oauth2/authorize';
                const codeVerifier = generateCodeVerifier(128);
                const codeChallenge = await generateCodeChallenge(codeVerifier);
                const encodedCodeChallenge = encodeURIComponent(codeChallenge);
                sessionStorage.setItem("code_verifier", codeVerifier);
                const url = `${authorizationEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=ALL&code_challenge=${encodedCodeChallenge}&code_challenge_method=S256`;
                window.location.href = url;
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
        }
    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthenticated(false);
    };

    async function exchangeCodeForToken(code: string) {
        const codeVerifier = sessionStorage.getItem("code_verifier");
        console.log(codeVerifier);
        const response = await axios.post("http://localhost:8080/api/oauth2/token", qs.stringify({
            grant_type: "authorization_code",
            code: code, // Le code que vous avez reçu
            redirect_uri: REDIRECT_URI, // URI de redirection
            client_id: CLIENT_ID, // ID de votre client
            code_verifier: codeVerifier // Si vous utilisez PKCE
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        sessionStorage.setItem("accessToken", response.data.access_token);
        const decoded = jwtDecode<MyJwtPayload>(response.data.access_token);
        setIsAuthenticated(true);
        setLoggedUser(decoded.sub!);
        console.log(decoded.sub);
        console.log(JSON.stringify(response.data));
    }

    const refreshAccessToken = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/oauth2/token", {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
            });

            setAccessToken(response.data.access_token);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Erreur lors du rafraîchissement du token :", error);
            logout(); // Déconnecte si le rafraîchissement échoue
        }
    };

    useEffect(() => {
        console.log("useEffect");
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
            exchangeCodeForToken(code);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout, refreshAccessToken, loggedUser }}>
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