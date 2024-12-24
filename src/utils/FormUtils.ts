import dayjs from "dayjs";
import { InscriptionAdulteBack, InscriptionAdulteFront, InscriptionEnfantBack, InscriptionEnfantFront } from "../services/inscription";
import { EleveBack, EleveFront } from "../services/eleve";
import { ClasseDtoB, FeuillePresenceDtoB, FeuillePresenceDtoF } from "../services/classe";
import * as XLSX from 'xlsx';

export function convertOuiNonToBoolean(value: string) {
    return value === "OUI" ? true : false;
}

export function convertBooleanToOuiNon(value: boolean) {
    return value === true ? "OUI" : "NON";
}

export const validatePhoneNumber = (_: any, value: any) => {
    const frenchMobilePhoneNumberRegex = /^(?:(?:\+|00)33|0)[67]\d{8}$/;
    if (!frenchMobilePhoneNumberRegex.test(value)) {
        return Promise.reject('Veuillez saisir un numéro de téléphone mobile valide.');
    }
    return Promise.resolve();
};

export const validateCodePostal = (_: any, value: any) => {
    const frenchPostalCodeRegex = /^(F-)?((2[A|B])|[0-9]{2})[0-9]{3}$/;
    if (!frenchPostalCodeRegex.test(value)) {
        return Promise.reject('Veuillez saisir un code postal valide.');
    }
    return Promise.resolve();
};

export const validateEmail = (_: any, value: any) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(value)) {
        return Promise.reject('Veuillez saisir une adresse e-mail valide.');
    }
    return Promise.resolve();
};

export const validateMajorite = (_: any, date: dayjs.Dayjs) => {
    const datePlus18ans = date.add(18, "year");
    if (datePlus18ans.isAfter(dayjs())) {
        return Promise.reject('Vous devez être majeur');
    }
    return Promise.resolve();
};

export const validateMontantMinAdhesion = (_: any, value: number) => {
    if (value < 15) {
        return Promise.reject('Le montant de votre cotisation ne peut être inférieur à 15 euros.');
    }
    return Promise.resolve();
};

export function prepareEleveBeforeSave(eleves: EleveFront[]) {
    return eleves.map(eleve => {
        const eleveToSave: EleveBack = {
            ...eleve,
            dateNaissance: dayjs(eleve.dateNaissance).format(APPLICATION_DATE_FORMAT),
        }
        return eleveToSave;
    })
};

export function prepareEleveBeforeForm(eleves: EleveBack[]) {
    return eleves.map(eleve => {
        const eleveToSave: EleveFront = {
            ...eleve,
            dateNaissance: dayjs(eleve.dateNaissance, APPLICATION_DATE_FORMAT),
        }
        return eleveToSave;
    })
};

export function prepareInscriptionEnfantBeforeSave(inscription: InscriptionEnfantFront) {
    const inscriptionToSave: InscriptionEnfantBack = {
        ...inscription,
        responsableLegal: {
            ...inscription.responsableLegal,
            autorisationAutonomie: convertOuiNonToBoolean(inscription.responsableLegal.autorisationAutonomie),
            autorisationMedia: convertOuiNonToBoolean(inscription.responsableLegal.autorisationMedia),
        },
        eleves: prepareEleveBeforeSave(inscription.eleves),
    };
    return inscriptionToSave;
}

export function prepareInscriptionEnfantBeforeForm(inscription: InscriptionEnfantBack) {
    const inscriptionToSave: InscriptionEnfantFront = {
        ...inscription,
        responsableLegal: {
            ...inscription.responsableLegal,
            autorisationAutonomie: convertBooleanToOuiNon(inscription.responsableLegal.autorisationAutonomie),
            autorisationMedia: convertBooleanToOuiNon(inscription.responsableLegal.autorisationMedia),
        },
        eleves: prepareEleveBeforeForm(inscription.eleves),
    };
    return inscriptionToSave;
}

export function prepareInscriptionAdulteBeforeForm(inscription: InscriptionAdulteBack) {
    const inscriptionToSave: InscriptionAdulteFront = {
        ...inscription,
        dateNaissance: dayjs(inscription.dateNaissance, APPLICATION_DATE_FORMAT),
    };
    return inscriptionToSave;
}

export function prepareInscriptionAdulteBeforeSave(inscription: InscriptionAdulteFront) {
    const inscriptionToSave: InscriptionAdulteBack = {
        ...inscription,
        dateNaissance: dayjs(inscription.dateNaissance).format(APPLICATION_DATE_FORMAT),
    };
    return inscriptionToSave;
}

export function prepareClasseBeforeForm(classe: ClasseDtoB) {
    const lienClassesF = classe.liensClasseEleves?.map(
        lien => ({ ...lien, eleve: prepareEleveBeforeForm([lien.eleve])[0] })
    );
    return {
        ...classe,
        liensClasseEleves: lienClassesF
    }
}

export function prepareFeuillePresenceBeforeForm(feuille: FeuillePresenceDtoB) {
    const feuillePresenceDtoF: FeuillePresenceDtoF = {
        ...feuille,
        date: dayjs(feuille.date, APPLICATION_DATE_FORMAT)
    }
    return feuillePresenceDtoF;
}


export const getConsentementInscriptionCoursLibelle = () => "En soumettant ce formulaire, vous consentez à ce que l'association musulmane du chablais collecte et traite vos données personnelles aux fins de votre inscription aux cours." +
    " Vos données seront conservées pendant toute la durée de votre inscription et seront accessibles pour consultation ou modification sur demande, par e-mail à l'adresse de l'association: amcinscription@gmail.com." +
    " Vous vous engagez également à respecter le règlement intérieur de l'école, disponible sur demande auprès des membres de l'association et également affiché dans les locaux.";

export const getConsentementAdhesionLibelle = () => "En soumettant ce formulaire, vous consentez à ce que l'association musulmane du chablais collecte et traite vos données personnelles aux fins de votre adhésion à l'association." +
    " Vos données seront conservées pendant toute la durée de votre adhésion et seront accessibles pour consultation ou modification sur demande, par e-mail à l'adresse de l'association: amcinscription@gmail.com.";

export const isInscriptionFerme = (inscriptionEnabledFromDate?: string) => {
    if (!inscriptionEnabledFromDate) {
        return true;
    }
    return dayjs(inscriptionEnabledFromDate, APPLICATION_DATE_FORMAT).isAfter(dayjs());
}

export type ExcelColumnHeadersType<T> = Partial<Record<keyof T, string>>;

function exportToExcel<T>(
    data: T[],
    columnHeaders: ExcelColumnHeadersType<T>,
    fileName: string
): void {
    if (!data || data.length === 0) {
        console.warn("No data provided for export.");
        return;
    }

    const transformValue = (value: any): string => {
        if (typeof value === "boolean") {
            return value ? "OUI" : "NON";
        }
        return value?.toString() ?? "";
    };

    // Préparer les données en fonction des `columnHeaders`
    const preparedData = data.map((row) => {
        const formattedRow: { [key: string]: string } = {};
        for (const key in columnHeaders) {
            const typedKey = key as keyof T;
            const columnHeader = columnHeaders[typedKey];
            if (columnHeader) {
                formattedRow[columnHeader] = transformValue(row[typedKey]);
            }
        }
        return formattedRow;
    });

    // Crée une feuille de calcul
    const ws = XLSX.utils.json_to_sheet(preparedData);

    // Crée un classeur et ajoute la feuille
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");

    // Sauvegarde le fichier Excel
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export default exportToExcel;

export const APPLICATION_DATE_FORMAT: string = "DD.MM.YYYY";
export const APPLICATION_DATE_TIME_FORMAT: string = "DD.MM.YYYY HH:mm:ss.SSS";

export const COURS_KEY_STEP_RESP_LEGAL = "1";
export const COURS_KEY_STEP_ELEVES = "2";
export const COURS_KEY_STEP_TARIF = "3";