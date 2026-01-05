import { useState, useEffect } from "react";
import { FormInstance, notification } from "antd";
import useApi from "../../../../../hooks/useApi";
import { PeriodeInfoDto } from "../../../../../services/periode";
import { ApplicationTarif, InfoTarifDto } from "../../../../../services/tarif";
import { DefaultOptionType } from "antd/es/select";
import { buildUrlWithParams, PERIODES_ENDPOINT, PERIODES_EXISTING_ENDPOINT, TARIFS_ADMIN_ENDPOINT, TARIFS_ADMIN_GET_ENDPOINT } from "../../../../../services/services";
import { getPeriodeOptions } from "../../../../common/CommonComponents";

export const useTarifManagement = (form: FormInstance) => {
    const { execute, isLoading } = useApi();
    const [periodesDto, setPeriodesDto] = useState<PeriodeInfoDto[]>();
    const [modalPeriodeOpen, setModalPeriodeOpen] = useState<boolean>(false);
    const [createPeriode, setCreatePeriode] = useState<boolean>(false);
    const [periodeToEdit, setPeriodeToEdit] = useState<PeriodeInfoDto>();
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [selectedIdPeriode, setSelectedIdPeriode] = useState<number | null>(null);
    const [viewTarif, setViewTarif] = useState<boolean>(false);
    const [openPopOver, setOpenPopOver] = useState<boolean>(false);
    const [application, setApplication] = useState<ApplicationTarif>("COURS_ENFANT");
    const [currentPage, setCurrentPage] = useState(1);

    const loadPeriodes = async () => {
        if (!modalPeriodeOpen) {
            const resultPeriodes = await execute<PeriodeInfoDto[]>({ method: "GET", url: PERIODES_ENDPOINT, params: { application } });
            if (resultPeriodes.success && resultPeriodes.successData) {
                setPeriodesDto(resultPeriodes.successData);
                setPeriodesOptions(getPeriodeOptions(resultPeriodes.successData));
            }
        }
    };

    useEffect(() => {
        if (!modalPeriodeOpen) {
            loadPeriodes();
        }
    }, [modalPeriodeOpen]);

    useEffect(() => {
        setPeriodesOptions([]);
        setViewTarif(false);
        setSelectedIdPeriode(null);
        form.setFieldValue("idPeriode", null);
        loadPeriodes();
    }, [application]);

    const onEditTarif = async () => {
        const resultTarifs = await execute({ method: "GET", url: buildUrlWithParams(TARIFS_ADMIN_GET_ENDPOINT, { id: selectedIdPeriode }) });
        if (resultTarifs.success && resultTarifs.successData) {
            setViewTarif(true);
            form.setFieldsValue(resultTarifs.successData);
        }
    };

    const onCreatePeriode = () => {
        setModalPeriodeOpen(true);
        setCreatePeriode(true);
        setPeriodeToEdit(undefined);
    };

    const onModifierPeriode = () => {
        setModalPeriodeOpen(true);
        setCreatePeriode(false);
        setPeriodeToEdit(periodesDto?.find(p => p.id === selectedIdPeriode));
    };

    const onDeletePeriode = async (periode: PeriodeInfoDto) => {
        const result = await execute({ 
            method: "DELETE", 
            url: buildUrlWithParams(PERIODES_EXISTING_ENDPOINT, { id: periode.id }) 
        });
        if (result.success) {
            notification.success({ message: 'La période a été supprimée avec succès' });
            if (selectedIdPeriode === periode.id) {
                setSelectedIdPeriode(null);
                setViewTarif(false);
            }
            loadPeriodes();
        }
    };

    const isSelectedPeriodeReadOnly = () => {
        return periodesDto?.find(p => p.id === selectedIdPeriode)?.existInscription ?? false;
    };

    const copierTarif = async (value: any) => {
        const resultTarifs = await execute<InfoTarifDto>({ method: "GET", url: buildUrlWithParams(TARIFS_ADMIN_GET_ENDPOINT, { id: value }) });
        if (resultTarifs.success && resultTarifs.successData) {
            const { idPeriode, ...rest } = resultTarifs.successData;
            form.setFieldsValue({ idPeriode: selectedIdPeriode, ...rest });
            notification.open({ message: "Les tarifs de la période sélectionnée ont bien été copiés", type: "success" });
        }
    };

    const onFinish = async (infoTarif: InfoTarifDto) => {
        const resultSavedTarifs = await execute({ method: "POST", url: TARIFS_ADMIN_ENDPOINT, data: infoTarif });
        if (resultSavedTarifs.success && resultSavedTarifs.successData) {
            setViewTarif(true);
            notification.open({ message: "Les nouveaux tarifs ont bien été enregistrés", type: "success" });
            form.setFieldsValue(resultSavedTarifs.successData);
        }
    };

    const onSelectPeriode = async (periode: PeriodeInfoDto) => {
        setSelectedIdPeriode(periode.id);
        form.setFieldValue("idPeriode", periode.id);
        const resultTarifs = await execute({ method: "GET", url: buildUrlWithParams(TARIFS_ADMIN_GET_ENDPOINT, { id: periode.id }) });
        if (resultTarifs.success && resultTarifs.successData) {
            setViewTarif(true);
            form.setFieldsValue(resultTarifs.successData);
        }
    };

    const onApplicationChange = (value: ApplicationTarif) => {
        setApplication(value);
    };

    return {
        periodesDto,
        periodesOptions,
        selectedIdPeriode,
        viewTarif,
        openPopOver,
        application,
        currentPage,
        modalPeriodeOpen,
        createPeriode,
        periodeToEdit,
        isLoading,
        setCurrentPage,
        setOpenPopOver,
        setModalPeriodeOpen,
        onEditTarif,
        onCreatePeriode,
        onModifierPeriode,
        onDeletePeriode,
        isSelectedPeriodeReadOnly,
        copierTarif,
        onFinish,
        onSelectPeriode,
        onApplicationChange,
    };
};
