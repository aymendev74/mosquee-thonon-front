export enum ParamName {
    REINSCRIPTION_ENABLED = "REINSCRIPTION_ENABLED",
    ANNEE_SCOLAIRE = "ANNEE_SCOLAIRE",
}

export type ParamDto = {
    name: ParamName,
    value: string,
}
