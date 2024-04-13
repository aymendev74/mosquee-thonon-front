import { ResponsableLegal } from "../services/ResponsableLegal";

export const onNumericFieldChanged = (e: any) => {
    console.log(isNaN(parseInt(e.key)));
    if (!["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key) && isNaN(parseInt(e.key))) {
        e.preventDefault();
    }
}

export const convertOuiNonToBoolean = (responsableLegal: ResponsableLegal) => {
    responsableLegal.autorisationAutonomie = responsableLegal.autorisationAutonomie === "OUI" ? true : false;
    responsableLegal.autorisationMedia = responsableLegal.autorisationMedia === "OUI" ? true : false;
}

export const convertBooleanToOuiNon = (responsableLegal: ResponsableLegal) => {
    responsableLegal.autorisationAutonomie = responsableLegal.autorisationAutonomie === true ? "OUI" : "NON";
    responsableLegal.autorisationMedia = responsableLegal.autorisationMedia === true ? "OUI" : "NON";
}

export const validatePhoneNumber = (mobile: string, telephone: string) => {
    if (!telephone && !mobile) {
        return Promise.reject('Veuillez saisir au moins un numéro de téléphone');
    }
    return Promise.resolve();
};

export const APPLICATION_DATE_FORMAT: string = "DD.MM.YYYY";
export const APPLICATION_DATE_TIME_FORMAT: string = "DD.MM.YYYY HH:mm:ss.SSS";