import { Dayjs } from "dayjs";

export enum ParamName {
    REINSCRIPTION_ENABLED = "REINSCRIPTION_ENABLED",
    INSCRIPTION_ENFANT_ENABLED_FROM_DATE = "INSCRIPTION_ENFANT_ENABLED_FROM_DATE",
    INSCRIPTION_ADULTE_ENABLED_FROM_DATE = "INSCRIPTION_ADULTE_ENABLED_FROM_DATE",
    SEND_EMAIL_ENABLED = "SEND_EMAIL_ENABLED",
}

export type ParamDto = {
    name: ParamName,
    value: string,
}

export type ParamsDto<T extends string | Dayjs> = {
    reinscriptionPrioritaire?: boolean;
    inscriptionEnfantEnabledFromDate?: T;
    inscriptionAdulteEnabledFromDate?: T;
    sendMailEnabled?: boolean;
}

export type ParamsDtoF = ParamsDto<Dayjs>;
export type ParamsDtoB = ParamsDto<string>;