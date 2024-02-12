import { Moment } from "moment";
import { ResponsableLegal } from "./ResponsableLegal";
import { Eleve } from "./eleve";

export enum StatutInscription {
    PROVISOIRE = "PROVISOIRE",
    VALIDEE = "VALIDEE",
    LISTE_ATTENTE = "LISTE_ATTENTE",
}

export type SignatureDto = {
    dateCreation: string;
    visaCreation: string;
    dateModification: string;
    visaModification: string;
}

export type Inscription = {
    id: number;
    statut: StatutInscription | boolean;
    dateInscription: Moment | string;
    responsableLegal: ResponsableLegal;
    eleves: Eleve[];
    signature?: SignatureDto;
}

export type InscriptionLight = {
    id: number;
    idInscription: number;
    nom: string;
    prenom: string;
    dateNaissance: Moment | string;
    niveau: string;
    telephone: string;
    mobile: string;
    statut: StatutInscription;
    ville: string;
    dateInscription: Moment | string;
}

export type InscriptionForExport = Omit<InscriptionLight, "id" | "idInscription">;

export enum NiveauScolaire {
    CP = "CP",
    CE1 = "CE1",
    CE2 = "CE2",
    CM1 = "CM1",
    CM2 = "CM2",
    COLLEGE_6EME = "COLLEGE_6EME",
    COLLEGE_5EME = "COLLEGE_5EME",
    COLLEGE_4EME = "COLLEGE_4EME",
    COLLEGE_3EME = "COLLEGE_3EME",
    LYCEE_2ND = "LYCEE_2ND",
    LYCEE_1ERE = "LYCEE_1ERE",
    LYCEE_TERM = "LYCEE_TERM",
}

export enum NiveauInterne {
    PREPARATOIRE = "PREPARATOIRE",
    CONFIRME = "CONFIRME",
    SUPERIEUR = "SUPERIEUR",
    SENIOR = "SENIOR",
}