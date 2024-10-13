import { Button, Form, Modal, Result, Spin, Tabs, TabsProps, notification } from "antd";
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
import { EuroCircleOutlined, InfoCircleOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
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

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading, status } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionFinished, setInscriptionFinished] = useState<InscriptionEnfantFront>();
    const [isOnlyReinscriptionEnabled, setIsOnlyReinscriptionEnabled] = useState<boolean>(false);
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);
    const [codeIncoherence, setCodeIncoherence] = useState<string>();
    const [activeStep, setActiveStep] = useState<string>("1");
    const { warning } = Modal;

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;

    const calculTarif = () => {
        let adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        if (eleves.length > 0) {
            const nbEleves = eleves.length;
            if (id) {
                setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT, { id }), params: { adherent: adherent ?? false, nbEleves } });
            } else {
                setApiCallDefinition({ method: "GET", url: NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT, params: { adherent: adherent ?? false, nbEleves } });
            }
        } else {
            setTarifInscription(undefined);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setEleves([]);
    }

    const handleTabChange = async (activeKey: string) => {
        try {
            if (activeKey === "2" || activeKey === "3") {
                // si on veut passer à l'étape "élèves" ou "tarif", on lance la validation du formulaire (responsable légal)
                await form.validateFields();
                if (activeKey === "3" && eleves.length === 0) {
                    // Si on veut aller sur l'étape "tarif", et qu'on a pas saisie d'élèves, alors impossible
                    notification.open({ message: "Veuillez ajouter des élèves avant de pouvoir visualiser votre tarif", type: "warning" });
                    throw new Error("Pas d'élèves saisis, impossible de visualiser les tarifs");
                }
            }
            setActiveStep(activeKey);
        } catch (errorInfo) {
            console.log('Validation failed:', errorInfo);
        }
    }

    const onPreviousStep = () => {
        const newActiveStep = Number(activeStep) - 1;
        handleTabChange(String(newActiveStep));
    }

    const onNextStep = () => {
        const newActiveStep = Number(activeStep) + 1;
        handleTabChange(String(newActiveStep));
    }

    const tabItems: TabsProps['items'] = [
        {
            key: COURS_KEY_STEP_RESP_LEGAL,
            label: <><InfoCircleOutlined />Responsable légal</>,
            children: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} doCalculTarif={calculTarif} onNextStep={onNextStep} form={form} />,
        },
        {
            key: COURS_KEY_STEP_ELEVES,
            label: <><UserOutlined />Elèves</>,
            children: <Eleves isReadOnly={isReadOnly} isAdmin={isAdmin} form={form} eleves={eleves} setEleves={setEleves} onPreviousStep={onPreviousStep}
                onNextStep={onNextStep} />,
        },
        {
            key: COURS_KEY_STEP_TARIF,
            label: <><EuroCircleOutlined />Tarif</>,
            children: <Tarif eleves={eleves} tarifInscription={tarifInscription} form={form} isAdmin={isAdmin} isReadOnly={isReadOnly}
                onPreviousStep={onPreviousStep} consentementChecked={consentementChecked} setConsentementChecked={setConsentementChecked} />,
        }
    ];

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
            setApiCallDefinition({ method: "POST", url: buildUrlWithParams(CHECK_COHERENCE_INSCRIPTION_ENDPOINT, { id }), data: inscriptionToSave });
        } else {
            setApiCallDefinition({ method: "POST", url: CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT, data: inscriptionToSave });
        }
    };

    const checkCoherenceApiCallBack = (result: any) => {
        setCodeIncoherence(result);
        resetApi();
    }

    const tarifInscriptionApiCallBack = (result: any) => {
        if (result) {
            setTarifInscription(result);
            notification.open({ message: "Votre tarif a été mis à jour (voir l'onglet Tarif)", type: "success" });
        } else if (status === HttpStatusCode.NoContent) { // No content (pas de tarif pour la période)
            notification.open({ message: "Aucun tarif n'a été trouvé pour la période en cours", type: "error" });
            setTarifInscription(undefined);
        }
        resetApi();
    }

    const apiCallbacks: ApiCallbacks = {
        [`PUT:${INSCRIPTION_ENFANT_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
            navigate("/adminCours", { state: { application: "COURS_ENFANT" } });
            resetApi();
        },
        [`POST:${NEW_INSCRIPTION_ENFANT_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Votre inscription a bien été enregistrée", type: "success" });
            setInscriptionFinished(result);
            resetForm();
            resetApi();
        },
        [`GET:${INSCRIPTION_ENFANT_ENDPOINT}`]: (result: any) => {
            const loadedInscription = result as InscriptionEnfantBack;
            const inscriptionFormValues: InscriptionEnfantFront = prepareInscriptionEnfantBeforeForm(loadedInscription);
            form.setFieldsValue(inscriptionFormValues);
            setEleves(inscriptionFormValues.eleves);
            resetApi();
        },
        [`GET:${NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT}`]: tarifInscriptionApiCallBack,
        [`GET:${INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT}`]: tarifInscriptionApiCallBack,
        [`GET:${PARAM_ENDPOINT}`]: (result: any) => {
            const resultAsParamsDto = result as ParamsDtoB;
            setIsOnlyReinscriptionEnabled(resultAsParamsDto.reinscriptionPrioritaire ?? false);
            setIsInscriptionsFermees(isInscriptionFerme(resultAsParamsDto.inscriptionEnfantEnabledFromDate));
            resetApi();
        },
        [`POST:${CHECK_COHERENCE_INSCRIPTION_ENDPOINT}`]: checkCoherenceApiCallBack,
        [`POST:${CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT}`]: checkCoherenceApiCallBack,
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

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    useEffect(() => {
        if (codeIncoherence === "ELEVE_ALREADY_EXISTS") {
            notification.open({ message: "Au moins un élève saisi figure déjà dans une autre demande d'inscription sur la même période", type: "error" });
            setCodeIncoherence(undefined);
        } else if (codeIncoherence === "NO_INCOHERENCE") {
            const inscriptionFormValues: InscriptionEnfantFront = _.cloneDeep(form.getFieldsValue());
            let sendMailConfirmation = form.getFieldValue("sendMailConfirmation");
            if (!isAdmin) { // si pas en mode admin, l'envoi du mail est systématique
                sendMailConfirmation = true;
            }
            inscriptionFormValues.eleves = _.cloneDeep(eleves);
            const inscriptionToSave = prepareInscriptionEnfantBeforeSave(inscriptionFormValues)
            setCodeIncoherence(undefined);
            if (id) {
                setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }), data: inscriptionToSave, params: { sendMailConfirmation } });
            } else {
                setApiCallDefinition({ method: "POST", url: NEW_INSCRIPTION_ENFANT_ENDPOINT, data: inscriptionToSave, params: { sendMailConfirmation } });
            }
        }
    }, [codeIncoherence])

    const onFinishFailed = () => {
        notification.open({ message: "Veuillez contrôler le formulaire car il y a des erreurs dans votre saisie", type: "error" });
    }

    useEffect(() => {
        // En mode admin on load l'inscription demandée
        if (id) {
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }) });
        } else { // Sinon on va simplement vérifier si les réinscriptions prioritaires sont activées
            setApiCallDefinition({ method: "GET", url: PARAM_ENDPOINT })
        }

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
        return inscriptionFinished ? getResult() : (<Tabs tabBarExtraContent centered activeKey={activeStep} items={tabItems} onChange={handleTabChange} type="card" />);
    }

    const getLoadingTip = () => {
        if (apiCallDefinition?.url === PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT) {
            return "Initialisation de l'application...";
        } else if (apiCallDefinition?.method === "POST" && apiCallDefinition.url === INSCRIPTION_ENFANT_ENDPOINT) {
            return "Enregistrement de votre inscription en cours...";
        } else {
            return "Chargement...";
        }
    }

    /*const getMessageDefilant = (type: TypeMessageDefilant) => {
        const message = type === TypeMessageDefilant.REINSCRIPTION_PRIORITAIRE ?
            "Actuellement, seules les réinscriptions sont autorisées. Vous pouvez vous inscrire pour l'année prochaine, uniquement si vous étiez déjà inscrit pendant "
            + "la dernière année scolaire. Les inscriptions pour les nouveaux élèves seront ouvertes ultérieurement."
            : "Il n'y a plus aucune place disponible pour la prochaine période scolaire, les inscriptions sont fermées."
        return (
            <div className="message-scroll-container">
                <div className="message-scroll">
                    {message}
                </div>
            </div>
        );
    }*/


    const getInscriptionFermeesContent = () => {
        return (
            <>
                <div className="centered-content-v">
                    <div className="inscription-closed" />
                    <div>Les inscriptions sont actuellement fermées</div>
                </div>
            </>
        );
    }

    return isInscriptionsFermees ? getInscriptionFermeesContent() :
        (
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
                <Spin spinning={isLoading} size="large" tip={getLoadingTip()}>
                    {getFormContent()}
                    <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
                </Spin>
            </Form >
        );

}