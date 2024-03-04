import { Moment } from "moment";
import { SignatureDto } from "./inscription";
import { Dayjs } from "dayjs";

export type PeriodeDto = {
    id: number;
    dateDebut: Dayjs | string;
    dateFin: Dayjs | string;
    nbMaxInscription: number;
    application: string;
    signature: SignatureDto;
}

export type PeriodeInfoDto = PeriodeDto & {
    existInscription: boolean;
    active: boolean;
}

export type PeriodeValidationResultDto = {
    periode: PeriodeDto;
    success: boolean;
    errorCode: string;
}