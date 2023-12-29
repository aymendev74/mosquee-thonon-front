import { Moment } from "moment";
import { SignatureDto, StatutInscription } from "./inscription";

export type Adhesion = {
    id: number;
    titre: string;
    nom: string;
    prenom: string;
    dateNaissance: Moment | string;
    idTarif: number;
    telephone: string;
    mobile: string;
    email: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    montantAutre: number;
    statut: StatutInscription | boolean;
    signature: SignatureDto;
}