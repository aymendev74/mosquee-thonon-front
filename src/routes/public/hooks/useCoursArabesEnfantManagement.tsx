import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Modal, notification } from 'antd';
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
    PARAM_ENDPOINT,
    NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT,
    INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT
} from '../../../services/services';
import {
    InscriptionEnfantBack,
    InscriptionEnfantFront,
    StatutInscription
} from '../../../services/inscription';
import { EleveFront } from '../../../services/eleve';
import { TarifInscriptionDto } from '../../../services/tarif';
import { ParamsDtoB } from '../../../services/parametres';
import {
    isInscriptionFerme,
    prepareInscriptionEnfantBeforeForm,
    prepareInscriptionEnfantBeforeSave
} from '../../../utils/FormUtils';

interface UseCoursArabesEnfantManagementProps {
    form: FormInstance;
}

export const useCoursArabesEnfantManagement = ({ form }: UseCoursArabesEnfantManagementProps) => {
    const { execute, isLoading } = useApi();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { roles } = useAuth();
    const { warning } = Modal;

    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionFinished, setInscriptionFinished] = useState<InscriptionEnfantBack>();
    const [isOnlyReinscriptionEnabled, setIsOnlyReinscriptionEnabled] = useState<boolean>(false);
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<number>(0);

    const isReadOnly = searchParams.get('readonly') === 'true';
    const isAdmin = roles.includes("ROLE_ADMIN");

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

    const handleCoherenceBeforeSaveInscription = async (codeIncoherence: string | null | undefined) => {
        if (codeIncoherence === "ELEVE_ALREADY_EXISTS") {
            notification.open({
                message: "Au moins un élève saisi figure déjà dans une autre demande d'inscription sur la même période",
                type: "error"
            });
        } else if (codeIncoherence === "NO_INCOHERENCE") {
            const inscriptionFormValues: InscriptionEnfantFront = _.cloneDeep(form.getFieldsValue());
            let sendMailConfirmation = form.getFieldValue("sendMailConfirmation");
            if (!isAdmin) {
                sendMailConfirmation = true;
            }
            inscriptionFormValues.eleves = _.cloneDeep(eleves);
            const inscriptionToSave = prepareInscriptionEnfantBeforeSave(inscriptionFormValues);

            if (id) {
                const { success } = await execute<InscriptionEnfantBack>({
                    method: "PUT",
                    url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }),
                    data: inscriptionToSave,
                    params: { sendMailConfirmation }
                });
                if (success) {
                    notification.open({
                        message: "Les modifications ont bien été enregistrées",
                        type: "success"
                    });
                    navigate("/adminCours", { state: { application: "COURS_ENFANT" } });
                }
            } else {
                const { success, successData } = await execute<InscriptionEnfantBack>({
                    method: "POST",
                    url: NEW_INSCRIPTION_ENFANT_ENDPOINT,
                    data: inscriptionToSave,
                    params: { sendMailConfirmation }
                });
                if (success && successData) {
                    notification.open({
                        message: "Votre inscription a bien été enregistrée",
                        type: "success"
                    });
                    setInscriptionFinished(successData);
                    resetForm();
                }
            }
        }
    };

    const onFinish = async (inscription: InscriptionEnfantFront) => {
        if (!isAdmin && !consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning"
            });
            return;
        }
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
            handleCoherenceBeforeSaveInscription(successData);
        } else {
            const { successData } = await execute<string>({
                method: "POST",
                url: CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT,
                data: inscriptionToSave
            });
            handleCoherenceBeforeSaveInscription(successData);
        }
    };

    const onFinishFailed = () => {
        notification.open({
            message: "Veuillez contrôler le formulaire car il y a des erreurs dans votre saisie",
            type: "error"
        });
    };

    const getReinscriptionPrioritaire = () => {
        return (
            <>
                <div>
                    Actuellement, <b>seuls les élèves déja inscrits cette année</b> sont autorisés à se reinscrire pour l'année prochaine<br /><br />
                    <b>Les inscriptions ne respectant pas ce critère seront automatiquement rejetées</b> par le système.
                </div>
            </>
        );
    };

    useEffect(() => {
        if (isOnlyReinscriptionEnabled) {
            warning({
                title: "Réinscription uniquement !",
                content: getReinscriptionPrioritaire()
            });
        }
    }, [isOnlyReinscriptionEnabled]);

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                const { successData: inscription } = await execute<InscriptionEnfantBack>({
                    method: "GET",
                    url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id })
                });
                if (inscription) {
                    const inscriptionFormValues: InscriptionEnfantFront = prepareInscriptionEnfantBeforeForm(inscription);
                    form.setFieldsValue(inscriptionFormValues);
                    setEleves(inscriptionFormValues.eleves);
                }
            } else {
                const { successData: params } = await execute<ParamsDtoB>({
                    method: "GET",
                    url: PARAM_ENDPOINT
                });
                if (params) {
                    setIsOnlyReinscriptionEnabled(params.reinscriptionPrioritaire ?? false);
                    setIsInscriptionsFermees(isInscriptionFerme(params.inscriptionEnfantEnabledFromDate));
                }
            }
        };
        loadData();
    }, []);

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
        isOnlyReinscriptionEnabled,
        isInscriptionsFermees,
        activeStep,
        id,
        isReadOnly,
        isAdmin,

        // Actions
        calculTarif,
        onPreviousStep,
        onNextStep,
        onFinish,
        onFinishFailed,
        handleStepChange,
    };
};
