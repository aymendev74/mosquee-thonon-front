import { ResponsableLegal } from "./ResponsableLegal";
import { Eleve } from "./eleve";
import { Dayjs } from "dayjs";

export enum StatutInscription {
    PROVISOIRE = "PROVISOIRE",
    VALIDEE = "VALIDEE",
    LISTE_ATTENTE = "LISTE_ATTENTE",
    REFUSE = "REFUSE",
}

export type SignatureDto = {
    dateCreation: string;
    visaCreation: string;
    dateModification: string;
    visaModification: string;
}

export type InscriptionSaveCriteria = {
    sendMailConfirmation: boolean;
}

export type InscriptionEnfant = {
    id: number;
    statut: StatutInscription | boolean;
    dateInscription: Dayjs | string;
    responsableLegal: ResponsableLegal;
    eleves: Eleve[];
    anneeScolaire: string;
    montantTotal: number;
    signature?: SignatureDto;
}

export type InscriptionLight = {
    id: number;
    idInscription: number;
    nom: string;
    prenom: string;
    nomResponsableLegal: string;
    prenomResponsableLegal: string;
    nomContactUrgence: string;
    prenomContactUrgence: string;
    dateNaissance: Dayjs | string;
    niveau: string;
    niveauInterne: string;
    mobile: string;
    mobileContactUrgence: string
    autorisationAutonomie: boolean,
    autorisationMedia: boolean,
    statut: StatutInscription;
    ville: string;
    dateInscription: Dayjs | string;
    noInscription: string;
    email: string;
}

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
    AUTRE = "AUTRE",
}

export enum NiveauInterne {
    P1 = "P1",
    P2 = "P2",
    N1_1 = "N1_1",
    N1_2 = "N1_2",
    N2_1 = "N2_1",
    N2_2 = "N2_2",
    N3_1 = "N3_1",
    N3_2 = "N3_2",
    N4_1 = "N4_1",
    N4_2 = "N4_2",
    DEBUTANT = "DEBUTANT",
    INTERMEDIAIRE = "INTERMEDIAIRE",
    AVANCE = "AVANCE",
}

export type InscriptionAdulte = {
    nom: string;
    prenom: string;
    email: string;
    dateNaissance: Dayjs | string;
    mobile: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    statut: StatutInscription;
    dateInscription: Dayjs | string;
    montant: number;
    anneeScolaire: string;
    montantTotal: number;
    niveauInterne: NiveauInterne;
} & {
    sendMailConfirmation: boolean;
}

export type TypeInscription = "ADULTE" | "ENFANT";

export type InscriptionPatchDto = {
    ids: number[];
    statut?: StatutInscription;
}