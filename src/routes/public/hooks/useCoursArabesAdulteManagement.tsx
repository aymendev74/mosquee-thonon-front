import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import useApi from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/AuthContext';
import { useMatieresStore } from '../../../components/stores/useMatieresStore';
import {
    buildUrlWithParams,
    INSCRIPTION_ADULTE_ENDPOINT,
    INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT,
    NEW_INSCRIPTION_ADULTE_ENDPOINT,
    NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT,
    PARAM_ENDPOINT
} from '../../../services/services';
import {
    InscriptionAdulteBack,
    InscriptionAdulteFront
} from '../../../services/inscription';
import { TarifInscriptionDto } from '../../../services/tarif';
import { ParamsDtoB } from '../../../services/parametres';
import { TypeMatiereEnum } from '../../../services/classe';
import {
    isInscriptionFerme,
    prepareInscriptionAdulteBeforeForm,
    prepareInscriptionAdulteBeforeSave
} from '../../../utils/FormUtils';
import { useLock } from '../../../hooks/useLock';
import { ResourceType, LockResultDto } from '../../../types/lock';

interface UseCoursArabesAdulteManagementProps {
    form: FormInstance;
}

export const useCoursArabesAdulteManagement = ({ form }: UseCoursArabesAdulteManagementProps) => {
    const { execute, isLoading } = useApi();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { roles } = useAuth();
    const { getMatieresByType } = useMatieresStore();

    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);

    const isReadOnly = searchParams.get('readonly') === 'true';
    const isAdmin = roles?.includes("ROLE_ADMIN");

    // Gestion du verrou pour l'édition
    const { lockStatus, acquireLock, releaseLock, updateLockStatus, isLocked } = useLock(
        ResourceType.INSCRIPTION,
        id ? parseInt(id) : null
    );

    // Forcer le mode lecture seule si le verrou est en conflit
    const effectiveReadOnly = isReadOnly || lockStatus.status === 'conflict';

    const handleTarifInscription = (result?: TarifInscriptionDto | null) => {
        if (result) {
            setTarifInscription(result);
        } else {
            notification.open({
                message: "Aucun tarif n'a été trouvé pour la période en cours",
                type: "error"
            });
            setTarifInscription(undefined);
        }
    };

    const onStatutProfessionnelChanged = async (value: any) => {
        if (value) {
            const { successData } = await execute<TarifInscriptionDto>({
                method: "GET",
                url: NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT,
                params: { statutProfessionnel: value }
            });
            handleTarifInscription(successData);
        } else {
            handleTarifInscription(undefined);
        }
    };

    const onFinish = async (inscription: InscriptionAdulteFront) => {
        const inscriptionToSave = prepareInscriptionAdulteBeforeSave(inscription);
        if (!isAdmin && !consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning"
            });
            return;
        }

        if (id) {
            const { sendMailConfirmation } = { ...inscription };
            const result = await execute({
                method: "PUT",
                url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }),
                data: inscriptionToSave,
                params: { sendMailConfirmation }
            });

            if (result.success) {
                await releaseLock();
                notification.open({
                    message: "Les modifications ont bien été enregistrées",
                    type: "success"
                });
                navigate("/adminCours", { state: { application: "COURS_ADULTE" } });
            } else if (result.errorData) {
                // Vérifier si c'est une erreur de conflit de verrou (409)
                const lockData = result.errorData as LockResultDto;
                if (lockData && typeof lockData.acquired !== 'undefined' && !lockData.acquired) {
                    // Le verrou a été perdu pendant l'édition
                    updateLockStatus({
                        status: 'conflict',
                        expiresAt: lockData.expiresAt,
                        username: lockData.username
                    });
                    notification.error({
                        message: "Verrou expiré",
                        description: `Votre verrou a expiré. Cette inscription est maintenant modifiée par ${lockData.username} jusqu'à ${new Date(lockData.expiresAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. Vos modifications n'ont pas été enregistrées.`,
                        duration: 8
                    });
                }
            }
        } else {
            const { success } = await execute({
                method: "POST",
                url: NEW_INSCRIPTION_ADULTE_ENDPOINT,
                data: inscriptionToSave
            });
            if (success) {
                setInscriptionSuccess(true);
                form.resetFields();
            }
        }
    };

    const getMatieresOptions = () => {
        return getMatieresByType(TypeMatiereEnum.ADULTE).map((matiere) => ({
            label: matiere.fr,
            value: matiere.code,
        }));
    };

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                // Tenter d'acquérir le verrou si on est en mode édition (admin et non readonly)
                if (isAdmin && !isReadOnly) {
                    await acquireLock();
                }

                const { successData: inscription } = await execute<InscriptionAdulteBack>({
                    method: "GET",
                    url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id })
                });
                if (inscription) {
                    const inscriptionFormValues: InscriptionAdulteFront = prepareInscriptionAdulteBeforeForm(inscription);
                    form.setFieldsValue(inscriptionFormValues);
                    const { successData: tarif } = await execute<TarifInscriptionDto>({
                        method: "GET",
                        url: buildUrlWithParams(INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT, { id }),
                        params: { statutProfessionnel: inscriptionFormValues.statutProfessionnel }
                    });
                    handleTarifInscription(tarif);
                }
            } else {
                const { successData: params } = await execute<ParamsDtoB>({
                    method: "GET",
                    url: PARAM_ENDPOINT
                });
                if (params) {
                    setIsInscriptionsFermees(isInscriptionFerme(params.inscriptionAdulteEnabledFromDate));
                }
            }
        };
        loadData();
    }, [id, isAdmin, isReadOnly]);

    return {
        // States
        isLoading,
        inscriptionSuccess,
        setInscriptionSuccess,
        consentementChecked,
        setConsentementChecked,
        tarifInscription,
        isInscriptionsFermees,
        id,
        isReadOnly: effectiveReadOnly,
        isAdmin,
        lockStatus,

        // Actions
        getMatieresOptions,
        onStatutProfessionnelChanged,
        onFinish,
    };
};
