import { Moment } from "moment";
import { NiveauInterne, NiveauScolaire, SignatureDto } from "./inscription";

export type Eleve = {
    id?: number;
    nom: string;
    prenom: string;
    dateNaissance: Moment | string;
    niveau: NiveauScolaire;
    niveauInterne?: NiveauInterne;
    idTarif?: number;
    signature?: SignatureDto;
}