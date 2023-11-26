import { Moment } from "moment";
import { NiveauScolaire, SignatureDto } from "./inscription";

export type Eleve = {
    id?: number;
    nom: string;
    prenom: string;
    dateNaissance: Moment | string;
    niveau: NiveauScolaire;
    idTarif?: number;
    signature?: SignatureDto;
}