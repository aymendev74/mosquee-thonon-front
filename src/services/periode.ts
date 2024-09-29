import { Dayjs } from "dayjs";

export type PeriodeDto<T extends Dayjs | string, U extends Dayjs | number> = {
    dateDebut: T;
    dateFin: T;
    anneeDebut: U;
    anneeFin: U;
    nbMaxInscription: number;
    application: string;
}

export type PeriodeDtoFront = PeriodeDto<Dayjs, Dayjs>;
export type PeriodeDtoBack = PeriodeDto<string, number>;

export type PeriodeInfoDto = {
    id: number,
    dateDebut: string;
    dateFin: string;
    anneeDebut: number;
    anneeFin: number;
    nbMaxInscription: number;
    application: string;
    existInscription: boolean;
    active: boolean;
}

export type PeriodeValidationResultDto = {
    periode: PeriodeDtoBack;
    success: boolean;
    errorCode: string;
}