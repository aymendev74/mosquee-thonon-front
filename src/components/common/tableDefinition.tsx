import { AdhesionLight } from "../../services/adhesion";
import { InscriptionEnfant, InscriptionEnfantLight } from "../../services/inscription";

export const getFileNameAdhesion = (adhesion: AdhesionLight) => {
    return "adhesion_" + adhesion.prenom + "_" + adhesion.nom;
}

export const getFileNameInscription = (inscription: InscriptionEnfantLight) => {
    return "inscription" + inscription.prenom + "_" + inscription.nom;
}