import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthResponse } from '../services/AuthResponse';

export type AuthContextValues = {
  loggedUser?: string,
  login?: (authResponse: AuthResponse) => void,
  logout?: () => void,
}

// Créez un contexte pour gérer l'authentification
const AuthContext = createContext<AuthContextValues>({});

// Hook personnalisé pour gérer l'authentification
export function useAuth() {
  return useContext(AuthContext);
}

// Fournit le contexte AuthProvider
export const AuthProvider = (props: any) => {
  const [loggedUser, setLoggedUser] = useState<string>();
  const navigate = useNavigate();

  const login = (authResponse: AuthResponse) => {
    sessionStorage.setItem("token", authResponse.accessToken)
    sessionStorage.setItem("loggedUser", authResponse.username)
    setLoggedUser(authResponse.username);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setLoggedUser(undefined);
    navigate("/");
  };

  useEffect(() => {
    if (sessionStorage.getItem("loggedUser")) {
      setLoggedUser(String(sessionStorage.getItem("loggedUser")));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loggedUser, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}