import { useState, useEffect } from "react";
import { InscriptionAdulteBack, InscriptionEnfantBack, InscriptionLight, InscriptionPatchDto, StatutInscription } from "../../../../services/inscription";
import { buildUrlWithParams, INSCRIPTION_ADULTE_ENDPOINT, INSCRIPTION_ENDPOINT, INSCRIPTION_ENFANT_ENDPOINT, PERIODES_ENDPOINT } from "../../../../services/services";
import { notification } from "antd";
import useApi from "../../../../hooks/useApi";
import { PeriodeInfoDto } from "../../../../services/periode";
import { DefaultOptionType } from "antd/es/select";
import { getPeriodeOptions } from "../../../../components/common/CommonComponents";

interface UseInscriptionManagementProps {
    application: string;
    type: "ADULTE" | "ENFANT";
}

export const useInscriptionManagement = ({ application, type }: UseInscriptionManagementProps) => {
    const [dataSource, setDataSource] = useState<InscriptionLight[]>([]);
    const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionLight[]>([]);
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [inscriptionsEnfantsById, setInscriptionsEnfantsById] = useState<Record<number, InscriptionEnfantBack>>({});
    const [inscriptionsAdultesById, setInscriptionsAdultesById] = useState<Record<number, InscriptionAdulteBack>>({});
    const { execute, isLoading } = useApi();

    useEffect(() => {
        const loadPeriodes = async () => {
            const resultPeriodes = await execute<PeriodeInfoDto[]>({ method: "GET", url: PERIODES_ENDPOINT, params: { application } });
            if (resultPeriodes.success && resultPeriodes.successData && resultPeriodes.successData?.length > 0) {
                const periodes = resultPeriodes.successData;
                setPeriodesOptions(getPeriodeOptions(periodes));
                const firstPeriodeId = periodes[0].id;
                loadInscriptions({ type, idPeriode: firstPeriodeId });
            }
        };
        loadPeriodes();
        setSelectedInscriptions([]);
    }, [type, application]);

    const loadInscriptions = async (params?: any) => {
        const resultInscriptions = await execute<InscriptionLight[]>({ method: "GET", url: INSCRIPTION_ENDPOINT, params });
        if (resultInscriptions.successData) {
            setDataSource(resultInscriptions.successData);
        }
    };

    const searchInscriptions = async (searchCriteria: any) => {
        await loadInscriptions(searchCriteria);
    };

    const getSelectedInscriptionDistinctIds = () => {
        return Array.from(new Set(selectedInscriptions.map(inscription => inscription.idInscription)));
    };

    const validateInscription = async (inscriptionId: number) => {
        const inscriptionPatch: InscriptionPatchDto = { id: inscriptionId, statut: StatutInscription.VALIDEE };
        const result = await execute({ method: "PATCH", url: INSCRIPTION_ENDPOINT, data: { inscriptions: [inscriptionPatch] } });
        if (result.success) {
            notification.success({ message: "L'inscription a été validée" });
            await loadInscriptions();
        }
    };

    const validateInscriptions = async (inscriptions: InscriptionLight[]) => {
        const distinctIds = Array.from(new Set(inscriptions.map(inscription => inscription.idInscription)));
        const inscriptionsPatch: InscriptionPatchDto[] = distinctIds.map(id => ({ id, statut: StatutInscription.VALIDEE }));
        const result = await execute({ method: "PATCH", url: INSCRIPTION_ENDPOINT, data: { inscriptions: inscriptionsPatch } });
        if (result.success) {
            notification.success({ message: "Les modifications ont bien été prises en compte" });
            setSelectedInscriptions([]);
            await loadInscriptions();
        }
    };

    const deleteInscription = async (inscriptionId: number) => {
        const result = await execute<number[]>({ method: "DELETE", url: INSCRIPTION_ENDPOINT, data: [inscriptionId] });
        if (result.success) {
            notification.success({ message: "L'inscription a été supprimée" });
            await loadInscriptions();
        }
    };

    const deleteInscriptions = async (inscriptions: InscriptionLight[]) => {
        const distinctIds = Array.from(new Set(inscriptions.map(inscription => inscription.idInscription)));
        const result = await execute<number[]>({ method: "DELETE", url: INSCRIPTION_ENDPOINT, data: distinctIds });
        if (result.success) {
            notification.success({ message: "Les modifications ont bien été prises en compte" });
            setSelectedInscriptions([]);
            await loadInscriptions();
        }
    };

    const loadInscription = async (id: number) => {
        if (type === "ENFANT") {
            const resultInscription = await execute<InscriptionEnfantBack>({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }) });
            if (resultInscription.success && resultInscription.successData) {
                setInscriptionsEnfantsById({ ...inscriptionsEnfantsById, [id]: resultInscription.successData });
            }
        } else {
            const resultInscription = await execute<InscriptionAdulteBack>({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id }) });
            if (resultInscription.success && resultInscription.successData) {
                setInscriptionsAdultesById({ ...inscriptionsAdultesById, [id]: resultInscription.successData });
            }
        }
    };

    const renderPdf = (idInscription: number) => {
        return type === "ENFANT" ? inscriptionsEnfantsById[idInscription] !== undefined
            : inscriptionsAdultesById[idInscription] !== undefined;
    };

    return {
        dataSource,
        selectedInscriptions,
        setSelectedInscriptions,
        periodesOptions,
        inscriptionsEnfantsById,
        inscriptionsAdultesById,
        isLoading,
        loadInscriptions,
        searchInscriptions,
        validateInscription,
        validateInscriptions,
        deleteInscription,
        deleteInscriptions,
        loadInscription,
        renderPdf,
        getSelectedInscriptionDistinctIds,
    };
};
