import moment from "moment";

export enum StatutInscription {
    PROVISOIRE = "PROVISOIRE",
    VALIDEE = "VALIDEE",
}

export type Inscription = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string | moment.Moment;
    telephone: string;
    email: string;
    sexe: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    statut: StatutInscription | boolean;
}