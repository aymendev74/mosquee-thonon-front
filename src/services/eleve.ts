import { NiveauInterne, NiveauScolaire } from "./inscription";
import { Dayjs } from "dayjs";

export enum Sexe {
    MASCULIN = "M",
    FEMININ = "F",
}

export type Eleve<T extends Dayjs | string> = {
    id?: number;
    nom: string;
    prenom: string;
    dateNaissance: T;
    niveau: NiveauScolaire;
    niveauInterne?: NiveauInterne;
    classeId?: number;
    resultat?: ResultatEnum;
}

export type EleveFront = Eleve<Dayjs>;
export type EleveBack = Eleve<string>;

export enum ResultatEnum {
    ACQUIS = "ACQUIS",
    NON_ACQUIS = "NON_ACQUIS",
}

export type EleveEnrichedDto = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    niveauInterne: NiveauInterne;
    mobile: string;
    mobileContactUrgence: string;
    autorisationAutonomie: boolean;
    autorisationMedia: boolean;
    nomResponsableLegal: string;
    prenomResponsableLegal: string;
    nomContactUrgence: string;
    prenomContactUrgence: string;
    resultat: ResultatEnum;
};

export type PatchEleve = Partial<EleveBack>;