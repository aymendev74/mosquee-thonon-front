import { Moment } from "moment";

export type PeriodeInfoDto = {
    id: number;
    dateDebut: Moment | string;
    dateFin: Moment | string;
    nbMaxInscription: number;
    existInscription: boolean;
}