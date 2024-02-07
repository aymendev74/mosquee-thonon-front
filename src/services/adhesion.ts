import { Moment } from "moment";
import { SignatureDto, StatutInscription } from "./inscription";

export type Adhesion = {
    id: number;
    titre: string;
    nom: string;
    prenom: string;
    dateNaissance: Moment | string;
    idTarif: number;
    telephone: string;
    mobile: string;
    email: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    montantAutre: number;
    montant: number;
    statut: StatutInscription | boolean;
    dateInscription: Moment | string;
    noMembre: number;
    signature: SignatureDto;
}

export type AdhesionLight = {
    id: number;
    nom: string;
    prenom: string;
    ville: string;
    montant: number;
    statut: StatutInscription | boolean;
    dateInscription: Moment | string;
}

export type AdhesionLightForExport = Omit<AdhesionLight, "id">;
