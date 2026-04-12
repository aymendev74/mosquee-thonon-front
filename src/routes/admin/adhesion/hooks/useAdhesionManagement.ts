import { useState, useEffect } from "react";
import { Adhesion, AdhesionLight, AdhesionPatchDto } from "../../../../services/adhesion";
import { ADHESION_ENDPOINT, ADHESION_SEARCH_ENDPOINT, DELETE_ADHESION_ENDPOINT, buildUrlWithParams } from "../../../../services/services";
import { StatutInscription } from "../../../../services/inscription";
import { notification } from "antd";
import useApi from "../../../../hooks/useApi";
import { LockResultDto } from "../../../../types/lock";

export const useAdhesionManagement = () => {
    const [dataSource, setDataSource] = useState<AdhesionLight[]>([]);
    const [selectedAdhesions, setSelectedAdhesions] = useState<AdhesionLight[]>([]);
    const { execute, isLoading } = useApi();

    // États pour gérer les alertes de conflits de locks groupés
    const [batchLockConflict, setBatchLockConflict] = useState<{
        show: boolean;
        resourceType: string;
        username?: string;
        expiresAt?: string;
    }>({ show: false, resourceType: 'adhésion' });

    // Fonction réutilisable pour gérer les conflits de locks groupés
    const handleBatchLockConflict = (errorData: any, action: string) => {
        const lockData = errorData as LockResultDto;
        if (lockData && typeof lockData.acquired !== 'undefined' && !lockData.acquired) {
            // Afficher une alerte de conflit pour les actions groupées
            setBatchLockConflict({
                show: true,
                resourceType: 'adhésion',
                username: lockData.username,
                expiresAt: lockData.expiresAt
            });
            notification.error({
                message: "Conflit de verrouillage",
                description: `Une des adhésions sélectionnées est actuellement modifiée par ${lockData.username}. Veuillez réessayer plus tard.`,
                duration: 6
            });
            return true; // Indique qu'un conflit a été géré
        }
        return false; // Pas de conflit géré
    };

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
        const adhesion = dataSource.find(a => a.id === adhesionId);
        if (adhesion) {
            await validateAdhesions([adhesion]);
        }
    };

    const validateAdhesions = async (adhesions: AdhesionLight[]) => {
        const adhesionsPatches: AdhesionPatchDto[] = adhesions.map(adhesion => ({ id: adhesion.id, statut: StatutInscription.VALIDEE }));
        const result = await execute<number[]>({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { adhesions: adhesionsPatches } });
        if (result.successData) {
            // Message différent selon le nombre d'adhésions
            const message = adhesions.length === 1
                ? "L'adhésion a été validée"
                : `Les ${result.successData.length} adhésions sélectionnées ont été validées`;
            notification.success({ message });

            // Ne réinitialiser la sélection que pour les actions groupées
            if (adhesions.length > 1) {
                setSelectedAdhesions([]);
            }
            await fetchAdhesions();
            // Réinitialiser l'alerte de conflit en cas de succès
            setBatchLockConflict({ show: false, resourceType: 'adhésion' });
        } else if (result.errorData) {
            // Gérer les conflits de locks groupés
            handleBatchLockConflict(result.errorData, 'validation');
        }
    };

    const deleteAdhesion = async (adhesionId: number) => {
        const adhesion = dataSource.find(a => a.id === adhesionId);
        if (adhesion) {
            await deleteAdhesions([adhesion]);
        }
    };

    const deleteAdhesions = async (adhesions: AdhesionLight[]) => {
        const result = await execute<number[]>({ method: "DELETE", url: DELETE_ADHESION_ENDPOINT, data: adhesions.map(a => a.id) });
        if (result.successData) {
            // Message différent selon le nombre d'adhésions
            const message = adhesions.length === 1
                ? "L'adhésion a été supprimée"
                : `Les ${result.successData.length} adhésions sélectionnées ont été supprimées`;
            notification.success({ message });

            // Ne réinitialiser la sélection que pour les actions groupées
            if (adhesions.length > 1) {
                setSelectedAdhesions([]);
            }
            await fetchAdhesions();
            // Réinitialiser l'alerte de conflit en cas de succès
            setBatchLockConflict({ show: false, resourceType: 'adhésion' });
        } else if (result.errorData) {
            // Gérer les conflits de locks groupés
            handleBatchLockConflict(result.errorData, 'suppression');
        }
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
        batchLockConflict,
        setBatchLockConflict,
    };
};
