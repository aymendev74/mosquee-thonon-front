import { Moment } from "moment";
import { SignatureDto } from "./inscription";

export type PeriodeDto = {
    id: number;
    dateDebut: Moment | string;
    dateFin: Moment | string;
    nbMaxInscription: number;
    signature: SignatureDto;
}

export type PeriodeInfoDto = PeriodeDto & {
    existInscription: boolean;
    active: boolean;
}