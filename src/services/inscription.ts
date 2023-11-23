import { Moment } from "moment";
import { ResponsableLegal } from "./ResponsableLegal";
import { Eleve } from "./eleve";

export enum StatutInscription {
    PROVISOIRE = "PROVISOIRE",
    VALIDEE = "VALIDEE",
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

export type InscriptionForExport = Omit<Inscription, "id" | "signature">;