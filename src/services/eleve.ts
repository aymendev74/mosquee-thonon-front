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
}

export type EleveFront = Eleve<Dayjs>;
export type EleveBack = Eleve<string>;
