import { DefaultOptionType } from "antd/es/select"
import { NiveauScolaire } from "../../services/inscription"

export const getNiveauOptions = (): DefaultOptionType[] => {
    return [{ value: NiveauScolaire.CP, label: "CP" }, { value: NiveauScolaire.CE1, label: "CE1" }, { value: NiveauScolaire.CE2, label: "CE2" },
    { value: NiveauScolaire.CM1, label: "CM1" }, { value: NiveauScolaire.CM2, label: "CM2" }, { value: NiveauScolaire.COLLEGE_6EME, label: "6ème" },
    { value: NiveauScolaire.COLLEGE_5EME, label: "5ème" }, { value: NiveauScolaire.COLLEGE_4EME, label: "4ème" }, { value: NiveauScolaire.COLLEGE_3EME, label: "3ème" },
    { value: NiveauScolaire.LYCEE_2ND, label: "2nd" }, { value: NiveauScolaire.LYCEE_1ERE, label: "1ère" }, { value: NiveauScolaire.LYCEE_TERM, label: "Terminal" }]
};

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
    } else {
        return "Inconnu";
    }
}