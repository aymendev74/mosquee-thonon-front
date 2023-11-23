import { Moment } from "moment";
import { SignatureDto } from "./inscription";

export type Eleve = {
    id?: number;
    nom: string;
    prenom: string;
    dateNaissance: Moment | string;
    niveau: string;
    signature?: SignatureDto;
}