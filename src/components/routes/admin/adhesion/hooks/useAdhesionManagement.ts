import { useState, useEffect } from "react";
import { AdhesionLight, AdhesionPatchDto } from "../../../../../services/adhesion";
import { ADHESION_SEARCH_ENDPOINT, DELETE_ADHESION_ENDPOINT } from "../../../../../services/services";
import { StatutInscription } from "../../../../../services/inscription";
import { notification } from "antd";
import useApi from "../../../../../hooks/useApi";

export const useAdhesionManagement = () => {
    const [dataSource, setDataSource] = useState<AdhesionLight[]>([]);
    const [selectedAdhesions, setSelectedAdhesions] = useState<AdhesionLight[]>([]);
    const [renderedPdfAdhesionIds, setRenderedPdfAdhesionsIds] = useState<number[]>([]);
    const { execute, isLoading } = useApi();

    useEffect(() => {
        fetchAdhesions();
    }, []);

    const fetchAdhesions = async () => {
        const result = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
        if (result.successData) {
            setDataSource(result.successData);
        }
    };

    const searchAdhesions = async (searchCriteria: any) => {
        const result = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT, params: searchCriteria });
        if (result.successData) {
            setDataSource(result.successData);
        }
    };

    const validateAdhesion = async (adhesionId: number) => {
        const adhesionPatch: AdhesionPatchDto = { id: adhesionId, statut: StatutInscription.VALIDEE };
        const result = await execute<number[]>({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { adhesions: [adhesionPatch] } });
        if (result.successData) {
            notification.success({ message: "L'adhésion a été validée" });
            await fetchAdhesions();
        }
    };

    const validateAdhesions = async (adhesions: AdhesionLight[]) => {
        const adhesionsPatches: AdhesionPatchDto[] = adhesions.map(adhesion => ({ id: adhesion.id, statut: StatutInscription.VALIDEE }));
        const result = await execute<number[]>({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { adhesions: adhesionsPatches } });
        if (result.successData) {
            notification.success({ message: `Les ${result.successData.length} adhésions sélectionnées ont été validées` });
            setSelectedAdhesions([]);
            await fetchAdhesions();
        }
    };

    const deleteAdhesion = async (adhesionId: number) => {
        const result = await execute<number[]>({ method: "DELETE", url: DELETE_ADHESION_ENDPOINT, data: [adhesionId] });
        if (result.successData) {
            notification.success({ message: "L'adhésion a été supprimée" });
            await fetchAdhesions();
        }
    };

    const deleteAdhesions = async (adhesions: AdhesionLight[]) => {
        const result = await execute<number[]>({ method: "DELETE", url: DELETE_ADHESION_ENDPOINT, data: adhesions.map(a => a.id) });
        if (result.successData) {
            notification.success({ message: `Les ${result.successData.length} adhésions sélectionnées ont été supprimées` });
            setSelectedAdhesions([]);
            await fetchAdhesions();
        }
    };

    const renderPdf = (idAdhesion: number) => {
        return renderedPdfAdhesionIds.includes(idAdhesion);
    };

    const generatePdf = (idAdhesion: number) => {
        setRenderedPdfAdhesionsIds([...renderedPdfAdhesionIds, idAdhesion]);
    };

    return {
        dataSource,
        selectedAdhesions,
        setSelectedAdhesions,
        isLoading,
        searchAdhesions,
        validateAdhesion,
        validateAdhesions,
        deleteAdhesion,
        deleteAdhesions,
        renderPdf,
        generatePdf,
    };
};
