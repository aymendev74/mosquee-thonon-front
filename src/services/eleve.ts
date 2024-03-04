import { Moment } from "moment";
import { NiveauInterne, NiveauScolaire, SignatureDto } from "./inscription";
import { Dayjs } from "dayjs";

export type Eleve = {
    id?: number;
    nom: string;
    prenom: string;
    dateNaissance: Dayjs | string;
    niveau: NiveauScolaire;
    niveauInterne?: NiveauInterne;
    idTarif?: number;
    signature?: SignatureDto;
}