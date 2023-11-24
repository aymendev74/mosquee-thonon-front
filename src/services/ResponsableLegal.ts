import { SignatureDto } from "./inscription";

export type ResponsableLegal = {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    mobile: string;
    email: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    idTarif: number;
    adherent: boolean;
    signature?: SignatureDto;
}