import { ResponsableLegal } from "../services/ResponsableLegal";

export const onNumericFieldChanged = (e: any) => {
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

export const getConsentementInscriptionCoursLibelle = () => "En soumettant ce formulaire, vous consentez à ce que l'association musulmane du chablais collecte et traite vos données personnelles aux fins de votre inscription aux cours." +
    " Vos données seront conservées pendant toute la durée de votre inscription et seront accessibles pour consultation ou modification sur demande, par e-mail à l'adresse de l'association: amcinscription@gmail.com." +
    " Vous vous engagez également à respecter le règlement intérieur de l'école, disponible sur demande auprès des membres de l'association et également affiché dans les locaux.";

export const getConsentementAdhesionLibelle = () => "En soumettant ce formulaire, vous consentez à ce que l'association musulmane du chablais collecte et traite vos données personnelles aux fins de votre adhésion à l'association." +
    " Vos données seront conservées pendant toute la durée de votre adhésion et seront accessibles pour consultation ou modification sur demande, par e-mail à l'adresse de l'association: amcinscription@gmail.com.";


export const APPLICATION_DATE_FORMAT: string = "DD.MM.YYYY";
export const APPLICATION_DATE_TIME_FORMAT: string = "DD.MM.YYYY HH:mm:ss.SSS";