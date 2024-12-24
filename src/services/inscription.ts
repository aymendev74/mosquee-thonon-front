import { ResponsableLegal } from "./ResponsableLegal";
import { Eleve, Sexe } from "./eleve";
import { Dayjs } from "dayjs";

export enum StatutInscription {
    PROVISOIRE = "PROVISOIRE",
    VALIDEE = "VALIDEE",
    LISTE_ATTENTE = "LISTE_ATTENTE",
    REFUSE = "REFUSE",
}

export type InscriptionSaveCriteria = {
    sendMailConfirmation: boolean;
}

export type InscriptionEnfant<T extends Dayjs | string, U extends string | boolean> = {
    id: number;
    statut: StatutInscription | boolean;
    responsableLegal: ResponsableLegal<U>;
    eleves: Eleve<T>[];
    anneeScolaire: string;
    montantTotal: number;
}

export type InscriptionEnfantFront = InscriptionEnfant<Dayjs, string>;
export type InscriptionEnfantBack = InscriptionEnfant<string, boolean>;

export type InscriptionLight = {
    id: number;
    idInscription: number;
    nom: string;
    prenom: string;
    nomResponsableLegal: string;
    prenomResponsableLegal: string;
    nomContactUrgence: string;
    prenomContactUrgence: string;
    dateNaissance: string;
    niveau: string;
    niveauInterne: string;
    mobile: string;
    mobileContactUrgence: string
    autorisationAutonomie: boolean,
    autorisationMedia: boolean,
    statut: StatutInscription;
    ville: string;
    dateInscription: string;
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

export type InscriptionAdulte<T extends Dayjs | string> = {
    nom: string;
    prenom: string;
    email: string;
    dateNaissance: T;
    mobile: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    statut: StatutInscription;
    anneeScolaire: string;
    montantTotal: number;
    niveauInterne: NiveauInterne;
    sexe: Sexe;
    statutProfessionnel: StatutProfessionel
} & {
    sendMailConfirmation: boolean;
}

export type InscriptionAdulteFront = InscriptionAdulte<Dayjs>;
export type InscriptionAdulteBack = InscriptionAdulte<string>;

export type TypeInscription = "ADULTE" | "ENFANT";

export type InscriptionPatchDto = Partial<InscriptionEnfantFront | InscriptionAdulteFront>;

export enum StatutProfessionel {
    ETUDIANT = "ETUDIANT",
    AVEC_ACTIVITE = "AVEC_ACTIVITE",
    SANS_ACTIVITE = "SANS_ACTIVITE",
}