import { ResponsableLegal } from "./ResponsableLegal";

export type TarifInscriptionDto = {
    // enfant
    tarifBase: number;
    tarifEleve: number;
    listeAttente: boolean;

    // adulte
    tarif: number;
}

export type TarifDto = {
    id: number;
    type: string;
    montant: number;
}

export type InfoTarifDto = {
    idPeriode: number;
    montantBase1Enfant: number;
    montantBase1EnfantAdherent: number;
    montantEnfant1Enfant: number;
    montantEnfant1EnfantAdherent: number;
    montantBase2Enfant: number;
    montantBase2EnfantAdherent: number;
    montantEnfant2Enfant: number;
    montantEnfant2EnfantAdherent: number;
    montantBase3Enfant: number;
    montantBase3EnfantAdherent: number;
    montantEnfant3Enfant: number;
    montantEnfant3EnfantAdherent: number;
    montantBase4Enfant: number;
    montantBase4EnfantAdherent: number;
    montantEnfant4Enfant: number;
    montantEnfant4EnfantAdherent: number;
}

export type ApplicationTarif = "COURS_ENFANT" | "COURS_ADULTE";
