import { Button, Form, Modal, Result, Spin, Steps, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { ApiCallbacks, buildUrlWithParams, CHECK_COHERENCE_INSCRIPTION_ENDPOINT, CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT, handleApiCall, INSCRIPTION_ENFANT_ENDPOINT, NEW_INSCRIPTION_ENFANT_ENDPOINT, PARAM_ENDPOINT, PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT, TARIFS_ENDPOINT, NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT, INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT } from "../../services/services";
import { InscriptionEnfantBack, InscriptionEnfantFront, StatutInscription } from "../../services/inscription";
import useApi from "../../hooks/useApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import { ModaleRGPD } from "../modals/ModalRGPD";
import { ResponsableLegal } from "../inscriptions/ResponsableLegal";
import { Tarif } from "../inscriptions/Tarif";
import { Eleves } from "../inscriptions/Eleves";
import { EleveFront } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";
import { CheckOutlined, EuroCircleOutlined, InfoCircleOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { APPLICATION_DATE_FORMAT, COURS_KEY_STEP_ELEVES, COURS_KEY_STEP_RESP_LEGAL, COURS_KEY_STEP_TARIF, isInscriptionFerme, prepareInscriptionEnfantBeforeForm, prepareInscriptionEnfantBeforeSave } from "../../utils/FormUtils";
import { HttpStatusCode } from "axios";
import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import { ParamsDto, ParamsDtoB } from "../../services/parametres";

/*enum TypeMessageDefilant {
    REINSCRIPTION_PRIORITAIRE = "REINSCRIPTION_PRIORITAIRE",
    INSCRIPTIONS_FERMEES = "INSCRIPTIONS_FERMEES"
}*/

export const CoursArabesEnfantForm: FunctionComponent = () => {

    const { execute, isLoading } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionFinished, setInscriptionFinished] = useState<InscriptionEnfantBack>();
    const [isOnlyReinscriptionEnabled, setIsOnlyReinscriptionEnabled] = useState<boolean>(false);
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<number>(0);
    const { warning } = Modal;

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;

    const calculTarif = async () => {
        let adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        if (eleves.length > 0) {
            const nbEleves = eleves.length;
            if (id) {
                const { successData: tarif } = await execute<TarifInscriptionDto>({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT, { id }), params: { adherent: adherent ?? false, nbEleves } });
                handleTarifInscription(tarif);
            } else {
                const { successData: tarif } = await execute<TarifInscriptionDto>({ method: "GET", url: NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT, params: { adherent: adherent ?? false, nbEleves } });
                handleTarifInscription(tarif);
            }
        } else {
            setTarifInscription(undefined);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setEleves([]);
    }

    const handleStepChange = async (newStep: number) => {
        // Empêcher le changement si on essaie d'aller en avant sans validation
        if (newStep > activeStep) {
            try {
                if (newStep === 1 || newStep === 2) {
                    // si on veut passer à l'étape "élèves" ou "tarif", on lance la validation du formulaire (responsable légal)
                    await form.validateFields();
                    if (newStep === 2 && eleves.length === 0) {
                        // Si on veut aller sur l'étape "tarif", et qu'on a pas saisie d'élèves, alors impossible
                        notification.open({ message: "Veuillez ajouter des élèves avant de pouvoir visualiser votre tarif", type: "warning" });
                        return; // Ne pas changer l'étape
                    }
                }
                setActiveStep(newStep);
            } catch (errorInfo) {
                console.log('Validation failed:', errorInfo);
                // Ne pas changer l'étape en cas d'erreur de validation
            }
        } else {
            // Permettre le retour en arrière sans validation
            setActiveStep(newStep);
        }
    }

    const onPreviousStep = () => {
        const newActiveStep = activeStep - 1;
        handleStepChange(newActiveStep);
    }

    const onNextStep = () => {
        const newActiveStep = activeStep + 1;
        handleStepChange(newActiveStep);
    }

    const steps = [
        {
            title: 'Responsable',
            icon: <InfoCircleOutlined />,
            content: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} doCalculTarif={calculTarif} onNextStep={onNextStep} form={form} />,
        },
        {
            title: 'Élèves',
            icon: <UserOutlined />,
            content: <Eleves isReadOnly={isReadOnly} isAdmin={isAdmin} form={form} eleves={eleves} setEleves={setEleves} onPreviousStep={onPreviousStep}
                onNextStep={onNextStep} />,
        },
        {
            title: 'Tarif',
            icon: <EuroCircleOutlined />,
            content: <Tarif eleves={eleves} tarifInscription={tarifInscription} form={form} isAdmin={isAdmin} isReadOnly={isReadOnly}
                onPreviousStep={onPreviousStep} consentementChecked={consentementChecked} setConsentementChecked={setConsentementChecked}
                isReinscriptionOnlyEnabled={isOnlyReinscriptionEnabled} />,
        }
    ];

    async function handleCoherenceBeforeSaveInscription(codeIncoherence: string | null | undefined) {
        if (codeIncoherence === "ELEVE_ALREADY_EXISTS") {
            notification.open({ message: "Au moins un élève saisi figure déjà dans une autre demande d'inscription sur la même période", type: "error" });
        } else if (codeIncoherence === "NO_INCOHERENCE") {
            const inscriptionFormValues: InscriptionEnfantFront = _.cloneDeep(form.getFieldsValue());
            let sendMailConfirmation = form.getFieldValue("sendMailConfirmation");
            if (!isAdmin) { // si pas en mode admin, l'envoi du mail est systématique
                sendMailConfirmation = true;
            }
            inscriptionFormValues.eleves = _.cloneDeep(eleves);
            const inscriptionToSave = prepareInscriptionEnfantBeforeSave(inscriptionFormValues)
            if (id) {
                const { success } = await execute<InscriptionEnfantBack>({ method: "PUT", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }), data: inscriptionToSave, params: { sendMailConfirmation } });
                if (success) {
                    notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
                    navigate("/adminCours", { state: { application: "COURS_ENFANT" } });
                }
            } else {
                const { success, successData } = await execute<InscriptionEnfantBack>({ method: "POST", url: NEW_INSCRIPTION_ENFANT_ENDPOINT, data: inscriptionToSave, params: { sendMailConfirmation } });
                if (success && successData) {
                    notification.open({ message: "Votre inscription a bien été enregistrée", type: "success" });
                    setInscriptionFinished(successData);
                    resetForm();
                }
            }
        }
    }

    const onFinish = async (inscription: InscriptionEnfantFront) => {
        if (!isAdmin && !consentementChecked) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
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
            const { successData } = await execute<string>({ method: "POST", url: buildUrlWithParams(CHECK_COHERENCE_INSCRIPTION_ENDPOINT, { id }), data: inscriptionToSave, params: { sendMailConfirmation } });
            handleCoherenceBeforeSaveInscription(successData);
        } else {
            const { successData } = await execute<string>({ method: "POST", url: CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT, data: inscriptionToSave });
            handleCoherenceBeforeSaveInscription(successData);
        }
    };

    const handleTarifInscription = (result?: TarifInscriptionDto | null) => {
        if (result) {
            setTarifInscription(result);
        } else { // No content (pas de tarif pour la période)
            notification.open({ message: "Aucun tarif n'a été trouvé pour la période en cours", type: "error" });
            setTarifInscription(undefined);
        }
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
    }

    useEffect(() => {
        if (isOnlyReinscriptionEnabled) {
            warning({
                title: "Réinscription uniquement !", content: getReinscriptionPrioritaire()
            });
        }
    }, [isOnlyReinscriptionEnabled]);

    const onFinishFailed = () => {
        notification.open({ message: "Veuillez contrôler le formulaire car il y a des erreurs dans votre saisie", type: "error" });
    }

    useEffect(() => {
        const loadData = async () => {
            // En mode admin on load l'inscription demandée
            if (id) {
                const { successData: inscription } = await execute<InscriptionEnfantBack>({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }) });
                if (inscription) {
                    const inscriptionFormValues: InscriptionEnfantFront = prepareInscriptionEnfantBeforeForm(inscription);
                    form.setFieldsValue(inscriptionFormValues);
                    setEleves(inscriptionFormValues.eleves);
                }
            } else { // Sinon on va simplement vérifier si les réinscriptions prioritaires sont activées
                const { successData: params } = await execute<ParamsDtoB>({ method: "GET", url: PARAM_ENDPOINT });
                if (params) {
                    setIsOnlyReinscriptionEnabled(params.reinscriptionPrioritaire ?? false);
                    setIsInscriptionsFermees(isInscriptionFerme(params.inscriptionEnfantEnabledFromDate));
                }
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        calculTarif();
    }, [eleves.length]);

    const getResult = () => {
        if (inscriptionFinished?.statut === StatutInscription.REFUSE) {
            return (<Result
                status="error"
                title="Inscription refusée"
                subTitle={(<div className="result-message">Votre inscription a été refusée car seules les réinscriptions sont actuellement autorisées. Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter l'AMC par e-mail : amcthonon@gmail.com<br />
                    Un mail récpitulatif vous a été envoyé à l'adresse e-mail indiquée.
                </div>)}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionFinished(undefined)}>
                        Nouvelle inscription
                    </Button>]}
            />);
        } else if (inscriptionFinished?.statut === StatutInscription.LISTE_ATTENTE) {
            return (<Result
                status="warning"
                title="Inscription en liste d'attente"
                subTitle={(<div className="result-message">Votre inscription a été enregistrée, cependant vous avez été placée sur liste d'attente.<br />
                    Un mail récpitulatif vous a été envoyé à l'adresse e-mail indiquée.
                </div>)}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionFinished(undefined)}>
                        Nouvelle inscription
                    </Button>]}
            />);
        } else {
            return (<Result
                status="success"
                title="Inscription enregistré"
                subTitle={<div className="result-message">Votre inscription a bien été enregistrée.<br />
                    Un mail récpitulatif vous a été envoyé à l'adresse e-mail indiquée.
                </div>}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionFinished(undefined)}>
                        Nouvelle inscription
                    </Button>]}
            />);
        }
    }

    const getFormContent = () => {
        if (inscriptionFinished) {
            return getResult();
        }
        
        return (
            <div className="steps-container">
                <Steps
                    current={activeStep}
                    className="custom-steps"
                    direction="horizontal"
                    responsive={false}
                    items={steps.map((item, index) => ({
                        title: item.title,
                        icon: index < activeStep ? <CheckOutlined style={{ color: 'green' }} /> : item.icon,
                        status: index < activeStep ? 'finish' : index === activeStep ? 'process' : 'wait',
                    }))}
                />
                <div className="steps-content">
                    {steps[activeStep].content}
                </div>
            </div>
        );
    }

    const getInscriptionFermeesContent = () => {
        return (
            <>
                <div className="centered-content-v">
                    <div className="inscription-closed" />
                    <div className="inscription-closed-text">Les inscriptions sont actuellement fermées</div>
                </div>
            </>
        );
    }

    return isInscriptionsFermees ? getInscriptionFermeesContent() :
        (
            <div className="centered-content">
                <Form
                    name="cours"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    className="container-form"
                    form={form}
                >
                    <h2 className="insc-enfant-title">
                        <TeamOutlined /> Inscription aux cours arabes pour enfants
                    </h2>
                    <Spin spinning={isLoading} size="large" tip={"Chargement..."}>
                        {getFormContent()}
                        <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
                    </Spin>
                </Form >
            </div>
        );
}