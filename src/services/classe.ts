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
    affectation: AffectationEleveEnum;
    avecNiveau: boolean;
}

export type SearchClasseCriteria = {
    anneeDebut: number;
    anneeFin: number;
}

export type LienClasseEleveDto<K extends string | Dayjs> = {
    eleve: Eleve<K>;
}

export enum JourActiviteEnum {
    SAMEDI_MATIN = "SAMEDI_MATIN",
    DIMANCHE_MATIN = "DIMANCHE_MATIN",
    DIMANCHE_APRES_MIDI = "DIMANCHE_APRES_MIDI",
}

export type ClasseActiviteDto = {
    jour: JourActiviteEnum;
}

type ClasseDto<K extends string | Dayjs> = {
    id?: number;
    libelle?: string;
    niveau?: NiveauInterne;
    idEnseignant?: number;
    nomPrenomEnseignant?: string;
    liensClasseEleves?: LienClasseEleveDto<K>[];
    debutAnneeScolaire: number;
    finAnneeScolaire: number;
    activites?: ClasseActiviteDto[];
}

export type ClasseDtoF = ClasseDto<Dayjs>;
export type ClasseDtoB = ClasseDto<string>;

export type PresenceEleveDto = {
    idEleve: number;
    present: boolean;
}

type FeuillePresenceDto<K extends string | Dayjs> = {
    id?: number;
    date: K;
    presenceEleves: PresenceEleveDto[];
}

export type FeuillePresenceDtoB = FeuillePresenceDto<string>;
export type FeuillePresenceDtoF = FeuillePresenceDto<Dayjs>;

export enum MatiereNoteEnum {
    A = "A",
    EA = "EA",
    NA = "NA",
}

export type BulletinMatiereDto = {
    idMatiere: number;
    note: MatiereNoteEnum;
    remarque: string;
}

export type BulletinDto = {
    id: number;
    idEleve: number;
    appreciation: string;
    nbAbsences: number;
    mois: number;
    annee: number;
    matieres: BulletinMatiereDto[];
}

export enum MatiereEnum {
    EXPRESSION_ORALE = "EXPRESSION_ORALE",
    DICTEE = "DICTEE",
    LECTURE = "LECTURE",
    ECRITURE = "ECRITURE",
    CORAN = "CORAN",
    EDUCATION_ISLAMIQUE = "EDUCATION_ISLAMIQUE",
    ASSIDUITE_COMPORTEMENT = "ASSIDUITE_COMPORTEMENT",
}

export type MatiereDto = {
    id: number;
    code: MatiereEnum;
    libelle: string;
}