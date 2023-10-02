import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthResponse } from '../services/AuthResponse';

export type AuthContextValues = {
  isAuthenticated?: boolean,
  login?: (authResponse: AuthResponse) => void,
  logout?: () => void,
}

// Créez un contexte pour gérer l'authentification
const AuthContext = createContext<AuthContextValues>({ isAuthenticated: false });

// Hook personnalisé pour gérer l'authentification
export function useAuth() {
  return useContext(AuthContext);
}

// Fournit le contexte AuthProvider
export const AuthProvider = (props: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = (authResponse: AuthResponse) => {
    sessionStorage.setItem("token", authResponse.accessToken)
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}