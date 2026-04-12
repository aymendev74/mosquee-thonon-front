import { useState, useEffect } from "react";
import { InscriptionAdulteBack, InscriptionEnfantBack, InscriptionLight, InscriptionPatchDto, StatutInscription } from "../../../../services/inscription";
import { buildUrlWithParams, INSCRIPTION_ADULTE_ENDPOINT, INSCRIPTION_ENDPOINT, INSCRIPTION_ENFANT_ENDPOINT, PERIODES_ENDPOINT } from "../../../../services/services";
import { notification } from "antd";
import useApi from "../../../../hooks/useApi";
import { PeriodeInfoDto } from "../../../../services/periode";
import { DefaultOptionType } from "antd/es/select";
import { getPeriodeOptions } from "../../../../components/common/CommonComponents";
import { LockResultDto } from "../../../../types/lock";

interface UseInscriptionManagementProps {
    application: string;
    type: "ADULTE" | "ENFANT";
}

export const useInscriptionManagement = ({ application, type }: UseInscriptionManagementProps) => {
    const [dataSource, setDataSource] = useState<InscriptionLight[]>([]);
    const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionLight[]>([]);
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const { execute, isLoading } = useApi();

    // États pour gérer les alertes de conflits de locks groupés
    const [batchLockConflict, setBatchLockConflict] = useState<{
        show: boolean;
        resourceType: string;
        username?: string;
        expiresAt?: string;
    }>({ show: false, resourceType: 'inscription' });

    // Fonction réutilisable pour gérer les conflits de locks groupés
    const handleBatchLockConflict = (errorData: any, action: string) => {
        const lockData = errorData as LockResultDto;
        if (lockData && typeof lockData.acquired !== 'undefined' && !lockData.acquired) {
            // Afficher une alerte de conflit pour les actions groupées
            setBatchLockConflict({
                show: true,
                resourceType: 'inscription',
                username: lockData.username,
                expiresAt: lockData.expiresAt
            });
            notification.error({
                message: "Conflit de verrouillage",
                description: `Une des inscriptions sélectionnées est actuellement modifiée par ${lockData.username}. Veuillez réessayer plus tard.`,
                duration: 6
            });
            return true; // Indique qu'un conflit a été géré
        }
        return false; // Pas de conflit géré
    };

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
        const inscription = dataSource.find(i => i.idInscription === inscriptionId);
        if (inscription) {
            await validateInscriptions([inscription]);
        }
    };

    const validateInscriptions = async (inscriptions: InscriptionLight[]) => {
        const distinctIds = Array.from(new Set(inscriptions.map(inscription => inscription.idInscription)));
        const inscriptionsPatch: InscriptionPatchDto[] = distinctIds.map(id => ({ id, statut: StatutInscription.VALIDEE }));
        const result = await execute({ method: "PATCH", url: INSCRIPTION_ENDPOINT, data: { inscriptions: inscriptionsPatch } });
        if (result.success) {
            // Message différent selon le nombre d'inscriptions
            const message = inscriptions.length === 1
                ? "L'inscription a été validée"
                : "Les modifications ont bien été prises en compte";
            notification.success({ message });

            // Ne réinitialiser la sélection que pour les actions groupées
            if (inscriptions.length > 1) {
                setSelectedInscriptions([]);
            }
            await loadInscriptions();
            // Réinitialiser l'alerte de conflit en cas de succès
            setBatchLockConflict({ show: false, resourceType: 'inscription' });
        } else if (result.errorData) {
            // Gérer les conflits de locks groupés
            handleBatchLockConflict(result.errorData, 'validation');
        }
    };

    const deleteInscription = async (inscriptionId: number) => {
        const inscription = dataSource.find(i => i.idInscription === inscriptionId);
        if (inscription) {
            await deleteInscriptions([inscription]);
        }
    };

    const deleteInscriptions = async (inscriptions: InscriptionLight[]) => {
        const distinctIds = Array.from(new Set(inscriptions.map(inscription => inscription.idInscription)));
        const result = await execute<number[]>({ method: "DELETE", url: INSCRIPTION_ENDPOINT, data: distinctIds });
        if (result.success) {
            // Message différent selon le nombre d'inscriptions
            const message = inscriptions.length === 1
                ? "L'inscription a été supprimée"
                : "Les modifications ont bien été prises en compte";
            notification.success({ message });

            // Ne réinitialiser la sélection que pour les actions groupées
            if (inscriptions.length > 1) {
                setSelectedInscriptions([]);
            }
            await loadInscriptions();
            // Réinitialiser l'alerte de conflit en cas de succès
            setBatchLockConflict({ show: false, resourceType: 'inscription' });
        } else if (result.errorData) {
            // Gérer les conflits de locks groupés
            handleBatchLockConflict(result.errorData, 'suppression');
        }
    };

    return {
        dataSource,
        selectedInscriptions,
        setSelectedInscriptions,
        periodesOptions,
        isLoading,
        loadInscriptions,
        searchInscriptions,
        validateInscription,
        validateInscriptions,
        deleteInscription,
        deleteInscriptions,
        getSelectedInscriptionDistinctIds,
        batchLockConflict,
        setBatchLockConflict,
    };
};
