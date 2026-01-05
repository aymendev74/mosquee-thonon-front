import { Dispatch, SetStateAction } from "react";
import { FormInstance } from "antd";
import { PeriodeInfoDto } from "../../../../services/periode";
import { ApplicationTarif, InfoTarifDto } from "../../../../services/tarif";
import { DefaultOptionType } from "antd/es/select";

export interface TarifViewProps {
    form: FormInstance;
    application: ApplicationTarif;
    periodesDto?: PeriodeInfoDto[];
    periodesOptions?: DefaultOptionType[];
    selectedIdPeriode: number | null;
    viewTarif: boolean;
    currentPage: number;
    openPopOver: boolean;
    modalPeriodeOpen: boolean;
    createPeriode: boolean;
    periodeToEdit?: PeriodeInfoDto;
    onApplicationChange: (value: ApplicationTarif) => void;
    onSelectPeriode: (periode: PeriodeInfoDto) => void;
    onCreatePeriode: () => void;
    onModifierPeriode: () => void;
    onDeletePeriode: (periode: PeriodeInfoDto) => void;
    onFinish: (infoTarif: InfoTarifDto) => void;
    onCopierTarif: (value: any) => void;
    setCurrentPage: (page: number) => void;
    setOpenPopOver: (open: boolean) => void;
    setModalPeriodeOpen: Dispatch<SetStateAction<boolean>>;
    isSelectedPeriodeReadOnly: () => boolean;
}
