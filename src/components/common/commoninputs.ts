import { DefaultOptionType } from "antd/es/select"
import { NiveauInterne, NiveauScolaire, StatutInscription, StatutProfessionel } from "../../services/inscription"
import { JourActiviteEnum } from "../../services/classe";
import { ResultatEnum } from "../../services/eleve";

export const getNiveauOptions = (): DefaultOptionType[] => {
    return [{ value: NiveauScolaire.CP, label: "CP" }, { value: NiveauScolaire.CE1, label: "CE1" }, { value: NiveauScolaire.CE2, label: "CE2" },
    { value: NiveauScolaire.CM1, label: "CM1" }, { value: NiveauScolaire.CM2, label: "CM2" }, { value: NiveauScolaire.COLLEGE_6EME, label: "6ème" },
    { value: NiveauScolaire.COLLEGE_5EME, label: "5ème" }, { value: NiveauScolaire.COLLEGE_4EME, label: "4ème" }, { value: NiveauScolaire.COLLEGE_3EME, label: "3ème" },
    { value: NiveauScolaire.LYCEE_2ND, label: "2nd" }, { value: NiveauScolaire.LYCEE_1ERE, label: "1ère" }, { value: NiveauScolaire.LYCEE_TERM, label: "Terminal" },
    { value: NiveauScolaire.AUTRE, label: "Autre" }]
};

export const getNiveauInterneEnfantOptions = (): DefaultOptionType[] => {
    return [{ value: NiveauInterne.P1, label: "P1" }, { value: NiveauInterne.P2, label: "P2" }, { value: NiveauInterne.N1_1, label: "N1-1" },
    { value: NiveauInterne.N1_2, label: "N1-2" }, { value: NiveauInterne.N2_1, label: "N2-1" }, { value: NiveauInterne.N2_2, label: "N2-2" },
    { value: NiveauInterne.N3_1, label: "N3-1" }, { value: NiveauInterne.N3_2, label: "N3-2" }, { value: NiveauInterne.N4_1, label: "N4-1" },
    { value: NiveauInterne.N4_2, label: "N4-2" }]
}

export const getNiveauInterneAdulteOptions = (): DefaultOptionType[] => {
    return [{ value: NiveauInterne.DEBUTANT, label: "Débutant" }, { value: NiveauInterne.INTERMEDIAIRE, label: "Intermédiaire" },
    { value: NiveauInterne.AVANCE, label: "Avancé" }]
}

export const getStatutInscriptionOptions = () => {
    return [
        { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
        { value: StatutInscription.VALIDEE, label: "Validée" },
        { value: StatutInscription.LISTE_ATTENTE, label: "Liste d'attente" },
        { value: StatutInscription.REFUSE, label: "Refusée" }
    ];
}

export const getStatutsProfessionnelsOptions = (): DefaultOptionType[] => {
    return [{ value: StatutProfessionel.ETUDIANT, label: "Etudiant" }, { value: StatutProfessionel.AVEC_ACTIVITE, label: "Activité lucrative" },
    { value: StatutProfessionel.SANS_ACTIVITE, label: "Sans activité lucrative" }]
}

export const getLibelleNiveauScolaire = (niveau: NiveauScolaire) => {
    if (niveau === NiveauScolaire.CP) {
        return "CP";
    } else if (niveau === NiveauScolaire.CE1) {
        return "CE1";
    } else if (niveau === NiveauScolaire.CE2) {
        return "CE2";
    } else if (niveau === NiveauScolaire.CM1) {
        return "CM1";
    } else if (niveau === NiveauScolaire.CM2) {
        return "CM2";
    } else if (niveau === NiveauScolaire.COLLEGE_6EME) {
        return "6ème";
    } else if (niveau === NiveauScolaire.COLLEGE_5EME) {
        return "5ème";
    } else if (niveau === NiveauScolaire.COLLEGE_4EME) {
        return "4ème";
    } else if (niveau === NiveauScolaire.COLLEGE_3EME) {
        return "3ème";
    } else if (niveau === NiveauScolaire.LYCEE_2ND) {
        return "2nd";
    } else if (niveau === NiveauScolaire.LYCEE_1ERE) {
        return "1ère";
    } else if (niveau === NiveauScolaire.LYCEE_TERM) {
        return "Terminal";
    } else if (niveau === NiveauScolaire.AUTRE) {
        return "Autre";
    } else {
        return "Inconnu";
    }
};

export function getJourActiviteOptions(): DefaultOptionType[] {
    return [
        { value: JourActiviteEnum.SAMEDI_MATIN, label: "Samedi matin" },
        { value: JourActiviteEnum.DIMANCHE_MATIN, label: "Dimanche matin" },
        { value: JourActiviteEnum.DIMANCHE_APRES_MIDI, label: "Dimanche après-midi" },
    ];
};

export function getResultatOptions(): DefaultOptionType[] {
    return [
        { value: ResultatEnum.ACQUIS, label: "Acquis" },
        { value: ResultatEnum.NON_ACQUIS, label: "Non acquis" },
    ];
}