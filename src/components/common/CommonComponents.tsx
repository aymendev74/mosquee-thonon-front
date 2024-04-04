import { Tag } from "antd";
import { PeriodeInfoDto } from "../../services/periode";
import { DefaultOptionType } from "antd/es/select";

export const formatPeriodeLibelle = (periode: PeriodeInfoDto) => {
    let libelle: string = (periode.dateDebut as string).concat(" - ").concat(periode.dateFin as string);
    if (periode.active) {
        libelle = libelle.concat(" (En cours)");
    }
    return <Tag color="blue">{libelle}</Tag>;
}

export const getPeriodeOptions = (periodes: PeriodeInfoDto[]) => {
    const periodesOptions: DefaultOptionType[] = [];
    periodes.forEach(periode => periodesOptions.push({ value: periode.id, label: formatPeriodeLibelle(periode) }));
    return periodesOptions;
}