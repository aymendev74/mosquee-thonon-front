import { Moment } from "moment";
import { SignatureDto } from "./inscription";

export type PeriodeDto = {
    id: number;
    dateDebut: Moment | string;
    dateFin: Moment | string;
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