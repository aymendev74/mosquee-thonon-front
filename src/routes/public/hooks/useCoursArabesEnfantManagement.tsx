import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import _ from 'lodash';
import useApi from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/AuthContext';
import {
    buildUrlWithParams,
    CHECK_COHERENCE_INSCRIPTION_ENDPOINT,
    CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT,
    INSCRIPTION_ENFANT_ENDPOINT,
    NEW_INSCRIPTION_ENFANT_ENDPOINT,
    NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT,
    INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT
} from '../../../services/services';
import {
    InscriptionEnfantBack,
    InscriptionEnfantFront,
    InscriptionEnfantResultDto,
} from '../../../services/inscription';
import { EleveFront } from '../../../services/eleve';
import { TarifInscriptionDto } from '../../../services/tarif';
import {
    prepareInscriptionEnfantBeforeForm,
    prepareInscriptionEnfantBeforeSave
} from '../../../utils/FormUtils';
import useParametres from '../../utilisateur/hooks/useParametres';
import { useLock } from '../../../hooks/useLock';
import { ResourceType, LockResultDto } from '../../../types/lock';

interface UseCoursArabesEnfantManagementProps {
    form: FormInstance;
}

export const useCoursArabesEnfantManagement = ({ form }: UseCoursArabesEnfantManagementProps) => {
    const { execute, isLoading } = useApi();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { roles } = useAuth();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionFinished, setInscriptionFinished] = useState<InscriptionEnfantResultDto>();
    const [activeStep, setActiveStep] = useState<number>(0);
    const { reinscriptionPrioritaire, isInscriptionsEnfantFermees } = useParametres();

    const isReadOnly = searchParams.get('readonly') === 'true';
    const isAdmin = roles.includes("ROLE_ADMIN");

    // Quand les réinscriptions sont ouvertes, ce formulaire est désactivé pour les non-admin
    // (les réinscriptions se font via le formulaire dédié ReinscriptionEnfantForm)
    // Les admins peuvent toujours accéder aux inscriptions existantes
    const isFormClosed = !isAdmin && (isInscriptionsEnfantFermees || reinscriptionPrioritaire);

    // Gestion du verrou pour l'édition
    const { lockStatus, acquireLock, releaseLock, updateLockStatus, isLocked } = useLock(
        ResourceType.INSCRIPTION,
        id ? parseInt(id) : null
    );

    // Forcer le mode lecture seule si le verrou est en conflit
    const effectiveReadOnly = isReadOnly || lockStatus.status === 'conflict';

    const calculTarif = async () => {
        let adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        if (eleves.length > 0) {
            const nbEleves = eleves.length;
            if (id) {
                const { successData: tarif } = await execute<TarifInscriptionDto>({
                    method: "GET",
                    url: buildUrlWithParams(INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT, { id }),
                    params: { adherent: adherent ?? false, nbEleves }
                });
                handleTarifInscription(tarif);
            } else {
                const { successData: tarif } = await execute<TarifInscriptionDto>({
                    method: "GET",
                    url: NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT,
                    params: { adherent: adherent ?? false, nbEleves }
                });
                handleTarifInscription(tarif);
            }
        } else {
            setTarifInscription(undefined);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setEleves([]);
    };

    const handleStepChange = async (newStep: number) => {
        if (newStep > activeStep) {
            try {
                if (newStep === 1 || newStep === 2) {
                    await form.validateFields();
                    if (newStep === 2 && eleves.length === 0) {
                        notification.open({
                            message: "Veuillez ajouter des élèves avant de pouvoir visualiser votre tarif",
                            type: "warning"
                        });
                        return;
                    }
                }
                setActiveStep(newStep);
            } catch (errorInfo) {
                console.log('Validation failed:', errorInfo);
            }
        } else {
            setActiveStep(newStep);
        }
    };

    const onPreviousStep = () => {
        const newActiveStep = activeStep - 1;
        handleStepChange(newActiveStep);
    };

    const onNextStep = () => {
        const newActiveStep = activeStep + 1;
        handleStepChange(newActiveStep);
    };

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

    const handleCoherenceBeforeSaveInscription = async (codeIncoherence: string | null | undefined, inscriptionToSave: InscriptionEnfantBack, sendMailConfirmation: boolean) => {
        if (codeIncoherence === "ELEVE_ALREADY_EXISTS") {
            notification.open({
                message: "Au moins un élève saisi figure déjà dans une autre demande d'inscription sur la même période",
                type: "error"
            });
        } else if (codeIncoherence === "NO_INCOHERENCE") {

            if (id) {
                const result = await execute<InscriptionEnfantBack>({
                    method: "PUT",
                    url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }),
                    data: inscriptionToSave,
                    params: { sendMailConfirmation }
                });

                if (result.success) {
                    await releaseLock();
                    notification.open({
                        message: "Les modifications ont bien été enregistrées",
                        type: "success"
                    });
                    navigate("/adminCours", { state: { application: "COURS_ENFANT" } });
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
                const { success, successData } = await execute<InscriptionEnfantResultDto>({
                    method: "POST",
                    url: NEW_INSCRIPTION_ENFANT_ENDPOINT,
                    data: inscriptionToSave,
                    params: { sendMailConfirmation }
                });
                if (success && successData) {
                    setInscriptionFinished(successData);
                    resetForm();
                }
            }
        }
    };

    const onFinish = async () => {
        if (!isAdmin && !consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning"
            });
            return;
        }
        const inscription = form.getFieldsValue(true) as InscriptionEnfantFront;
        const inscriptionDeepCopy = _.cloneDeep(inscription);
        if (inscriptionDeepCopy.responsableLegal.adherent == undefined) {
            inscriptionDeepCopy.responsableLegal.adherent = false;
        }
        inscriptionDeepCopy.eleves = _.cloneDeep(eleves);
        const inscriptionToSave: InscriptionEnfantBack = prepareInscriptionEnfantBeforeSave(inscriptionDeepCopy);

        if (id) {
            const { sendMailConfirmation } = { ...inscription };
            const { successData } = await execute<string>({
                method: "POST",
                url: buildUrlWithParams(CHECK_COHERENCE_INSCRIPTION_ENDPOINT, { id }),
                data: inscriptionToSave,
                params: { sendMailConfirmation }
            });
            handleCoherenceBeforeSaveInscription(successData, inscriptionToSave, sendMailConfirmation);
        } else {
            let sendMailConfirmation = true;
            const { successData } = await execute<string>({
                method: "POST",
                url: CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT,
                data: inscriptionToSave
            });
            handleCoherenceBeforeSaveInscription(successData, inscriptionToSave, sendMailConfirmation);
        }
    };

    const onFinishFailed = () => {
        notification.open({
            message: "Veuillez contrôler le formulaire car il y a des erreurs dans votre saisie",
            type: "error"
        });
    };

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                // Tenter d'acquérir le verrou si on est en mode édition (admin et non readonly)
                if (isAdmin && !isReadOnly) {
                    await acquireLock();
                }

                const { successData: inscription } = await execute<InscriptionEnfantBack>({
                    method: "GET",
                    url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id })
                });
                if (inscription) {
                    const inscriptionFormValues: InscriptionEnfantFront = prepareInscriptionEnfantBeforeForm(inscription);
                    form.setFieldsValue(inscriptionFormValues);
                    form.setFieldValue("confirmationEmail", inscriptionFormValues.responsableLegal.email);
                    setEleves(inscriptionFormValues.eleves);
                }
            }
        };
        loadData();
    }, [id, isAdmin, isReadOnly]);

    useEffect(() => {
        calculTarif();
    }, [eleves.length]);

    return {
        // States
        isLoading,
        modalRGPDOpen,
        setModalRGPDOpen,
        consentementChecked,
        setConsentementChecked,
        eleves,
        setEleves,
        tarifInscription,
        inscriptionFinished,
        setInscriptionFinished,
        isFormClosed,
        activeStep,
        id,
        isReadOnly: effectiveReadOnly,
        isAdmin,
        lockStatus,

        // Actions
        calculTarif,
        onPreviousStep,
        onNextStep,
        onFinish,
        onFinishFailed,
        handleStepChange,
    };
};
