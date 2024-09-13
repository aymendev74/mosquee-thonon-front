import { Moment } from "moment";
import { SignatureDto, StatutInscription } from "./inscription";
import { Dayjs } from "dayjs";

export type Adhesion = {
    id: number;
    titre: string;
    nom: string;
    prenom: string;
    dateNaissance: Dayjs | string;
    idTarif: number;
    mobile: string;
    email: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    montantAutre: number;
    montant: number;
    statut: StatutInscription | boolean;
    noMembre: number;
    signature: SignatureDto;
}

export type AdhesionLight = {
    id: number;
    nom: string;
    prenom: string;
    ville: string;
    montant: number;
    statut: StatutInscription | boolean;
    dateInscription: Dayjs | string;
}

export type AdhesionLightForExport = Omit<AdhesionLight, "id">;
