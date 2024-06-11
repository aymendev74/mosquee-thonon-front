export enum ParamName {
    REINSCRIPTION_ENABLED = "REINSCRIPTION_ENABLED",
    ANNEE_SCOLAIRE = "ANNEE_SCOLAIRE",
    INSCRIPTION_ENABLED = "INSCRIPTION_ENABLED",
}

export type ParamDto = {
    name: ParamName,
    value: string,
}
