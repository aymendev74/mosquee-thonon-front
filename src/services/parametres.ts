import { Dayjs } from "dayjs";

export enum ParamName {
    REINSCRIPTION_ENABLED = "REINSCRIPTION_ENABLED",
    INSCRIPTION_ENABLED_FROM_DATE = "INSCRIPTION_ENABLED_FROM_DATE",
    SEND_EMAIL_ENABLED = "SEND_EMAIL_ENABLED",
}

export type ParamDto = {
    name: ParamName,
    value: string,
}

export type ParamsDto = {
    reinscriptionPrioritaire: boolean;
    inscriptionEnabledFromDate: Dayjs | string;
    sendMailEnabled: boolean;
}