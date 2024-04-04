import { ResponsableLegal } from "../services/ResponsableLegal";
import { Inscription } from "../services/inscription";
import { PeriodeInfoDto } from "../services/periode";

export const onNumericFieldChanged = (e: any) => {
    if (!["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"].includes(e.key) && isNaN(e.key)) {
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

export const APPLICATION_DATE_FORMAT: string = "DD.MM.YYYY";