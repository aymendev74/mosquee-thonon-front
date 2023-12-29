import { ResponsableLegal } from "./ResponsableLegal";

export type TarifInscriptionDto = {
    tarifBase: number;
    tarifEleve: number;
    listeAttente: boolean;
}

export type TarifDto = {
    id: number;
    type: string;
    montant: number;
}