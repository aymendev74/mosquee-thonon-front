import { ReactNode } from "react";
import { AuthProvider, useAuth } from "../../hooks/AuthContext";

type PdfContextBridgeProps = {
    children: ReactNode;
};

/**
 * Ce composant est une solution de contournement au fait que react-pdf rend les composant en 
 * dehors du contexte de notre application. Sans ce composant qui encapsule le rendu du document
 * dans un AuthProvider, une erreur se produit car le composant PdfAdhesion ou PdfInscription 
 * n'a pas accès au hook useApi (qui lui utilise useAuth de AuthProvider pour récupérer le token)
 * 
 */

export const PdfAuthContextBridge = ({ children }: PdfContextBridgeProps) => {
    return <AuthProvider>{children}</AuthProvider>;
};