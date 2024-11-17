import dayjs, { Dayjs } from "dayjs";
import { Eleve } from "./eleve";
import { NiveauInterne } from "./inscription";

export enum AffectationEleveEnum {
    AVEC_AFFECTATION = "AVEC_AFFECTATION",
    SANS_AFFECTATION = "SANS_AFFECTATION",
    SANS_IMPORTANCE = "SANS_IMPORTANCE",
}

export type SearchEleveCriteria = {
    anneeDebut: number;
    anneeFin: number;
    affectation: AffectationEleveEnum
}

export type SearchClasseCriteria = {
    anneeDebut: number;
    anneeFin: number;
}

export type LienClasseEleveDto<K extends string | Dayjs> = {
    eleve: Eleve<K>;
}

export enum JourActiviteEnum {
    SAMEDI_MATIN = "SAM_MAT",
    DIMANCHE_MATIN = "DIM_MAT",
    DIMANCHE_APRES_MIDI = "DIM_APM",
}

export type ClasseActiviteDto = {
    jour: JourActiviteEnum;
}

export type ClasseDto<K extends string | Dayjs> = {
    id: number;
    libelle: string;
    niveau: NiveauInterne;
    idEnseignant: number;
    liensClasseEleves: LienClasseEleveDto<K>[];
    debutAnneeScolaire: number;
    finAnneeScolaire: number;
    activites: ClasseActiviteDto[];
}

export type ClasseDtoF = ClasseDto<Dayjs>;
export type ClasseDtoB = ClasseDto<string>;