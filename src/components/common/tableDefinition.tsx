import { AdhesionLight } from "../../services/adhesion";
import { Inscription, InscriptionLight } from "../../services/inscription";

export const getFileNameAdhesion = (adhesion: AdhesionLight) => {
    return "adhesion_" + adhesion.prenom + "_" + adhesion.nom;
}

export const getFileNameInscription = (inscription: InscriptionLight) => {
    return "inscription" + inscription.prenom + "_" + inscription.nom;
}