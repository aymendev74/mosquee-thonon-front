import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import qs from 'qs';
import { UserInfoDto } from '../services/AuthResponse';

type AuthContextType = {
    username: string | null;
    roles: string[];
    requestProfileInformations: () => void;
    login: () => Promise<void>;
    logout: () => void;
    handleAuthorizationCode: (code: string, state: string | null) => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
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
    const profileEndpoint = process.env.REACT_APP_BASE_URL_API + "/profile";
    const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
    const [loggedUser, setLoggedUser] = useState<UserInfoDto | null>(null);
    const username = loggedUser?.username ?? null;
    const roles = loggedUser?.roles ?? [];

    function getState() {
        const { pathname, search } = window.location
        if (pathname === "/login") {
            return null;
        }
        return `${pathname}${search}`;
    }

    const requestProfileInformations = useCallback(async () => {
        const userInfo = await axios.get<UserInfoDto>(profileEndpoint, { withCredentials: true }).then(response => response.data);
        setLoggedUser(userInfo);
    }, []);

    const login = useCallback(async () => {
        try {
            const from = getState();
            const codeVerifier = generateCodeVerifier(128);
            const codeChallenge = await generateCodeChallenge(codeVerifier);

            const statePayload = {
                code_verifier: codeVerifier,
                from
            };
            const state = encodeURIComponent(btoa(JSON.stringify(statePayload)));

            const url = `${authorizationEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectURI!)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256&state=${state}`;

            window.location.replace(url);
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
        }
    }, []);

    const logout = useCallback(async () => {
        window.location.replace(logoutEndpoint);
    }, []);

    const exchangeCodeForToken = useCallback(async (code: string, stateEncoded: string | null): Promise<string | null> => {
        let codeVerifier: string | null = null;
        let from: string | null = null;
        if (!stateEncoded) {
            console.error("le state est manquant au retour du serveur OAuth !");
            return null;
        }

        try {
            const stateDecoded = atob(decodeURIComponent(stateEncoded));
            const stateObj = JSON.parse(stateDecoded);
            codeVerifier = stateObj.code_verifier;
            from = stateObj.from;
        } catch (error) {
            console.error("Erreur de décodage du paramètre state :", error);
            return null;
        }

        if (!codeVerifier) {
            console.error("code_verifier manquant !");
            return null;
        }

        const responseToken = await axios.post(tokenEndpoint!, qs.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectURI,
            client_id: clientId,
            code_verifier: codeVerifier
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            withCredentials: true
        });
        setLoggedUser(responseToken.data);
        return from;
    }, []);

    const handleAuthorizationCode = useCallback(async (code: string, stateEncoded: string | null): Promise<string | null> => {
        let redirection: string | null = null;
        try {
            redirection = await exchangeCodeForToken(code, stateEncoded);
        } catch (e) {
            console.error("Erreur lors de l'échange du code :", e);
        } finally {
            // Nettoyer l'URL : enlever ?code=...&state=... sans recharger la page
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            return redirection;
        }
    }, []);

    return (
        <AuthContext.Provider value={{ handleAuthorizationCode, login, logout, username, roles, requestProfileInformations }}>
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