import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type AuthContextValues = {
  isAuthenticated?: boolean,
  login?: (token: string) => void,
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

  const login = (token: string) => {
    sessionStorage.setItem("token", token)
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}