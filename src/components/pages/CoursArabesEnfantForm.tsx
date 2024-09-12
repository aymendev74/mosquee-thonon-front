import { Badge, Button, Col, Form, Input, Result, Row, Spin, Tabs, TabsProps, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { CHECK_COHERENCE_INSCRIPTION_ENDPOINT, INSCRIPTION_ENFANT_ENDPOINT, INSCRIPTION_TARIFS_ENDPOINT, PARAM_ENDPOINT, PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT } from "../../services/services";
import { InscriptionEnfant, InscriptionSaveCriteria, StatutInscription } from "../../services/inscription";
import useApi from "../../hooks/useApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import { ModaleRGPD } from "../modals/ModalRGPD";
import { ResponsableLegal } from "../inscriptions/ResponsableLegal";
import { Tarif } from "../inscriptions/Tarif";
import { Eleves } from "../inscriptions/Eleves";
import { Eleve } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";
import { EuroCircleOutlined, InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT, COURS_KEY_STEP_ELEVES, COURS_KEY_STEP_RESP_LEGAL, COURS_KEY_STEP_TARIF, convertBooleanToOuiNon, convertTypesBeforeBackend } from "../../utils/FormUtils";
import { InputFormItem } from "../common/InputFormItem";
import { HttpStatusCode } from "axios";
import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import { ParamsDto } from "../../services/parametres";

enum TypeMessageDefilant {
    REINSCRIPTION_PRIORITAIRE = "REINSCRIPTION_PRIORITAIRE",
    INSCRIPTIONS_FERMEES = "INSCRIPTIONS_FERMEES"
}

export const CoursArabesEnfantForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading, status } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionFinished, setInscriptionFinished] = useState<InscriptionEnfant>();
    const [isOnlyReinscriptionEnabled, setIsOnlyReinscriptionEnabled] = useState<boolean>(false);
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);
    const [codeIncoherence, setCodeIncoherence] = useState<string>();
    const [activeStep, setActiveStep] = useState<string>("1");

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;

    const calculTarif = () => {
        let adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        if (eleves.length > 0) {
            const nbEleves = eleves.length;
            let atDate = form.getFieldValue("dateInscription");
            if (atDate) {
                atDate = dayjs(atDate).format(APPLICATION_DATE_FORMAT);
            }
            setApiCallDefinition({ method: "POST", url: INSCRIPTION_TARIFS_ENDPOINT, data: { adherent: adherent ?? false, nbEleves, atDate, isAdmin } });
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

    const onFinish = async (inscription: InscriptionEnfant) => {
        if (!isAdmin && !consentementChecked) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }
        const inscriptionDeepCopy = _.cloneDeep(inscription);
        if (inscriptionDeepCopy.responsableLegal.adherent == undefined) {
            inscriptionDeepCopy.responsableLegal.adherent = false;
        }
        inscriptionDeepCopy.eleves = _.cloneDeep(eleves);
        convertTypesBeforeBackend(inscriptionDeepCopy);
        setApiCallDefinition({ method: "POST", url: CHECK_COHERENCE_INSCRIPTION_ENDPOINT, data: inscriptionDeepCopy });
    };

    const isInscriptionFerme = (inscriptionEnabledFromDate: string | Dayjs) => {
        if (!inscriptionEnabledFromDate) {
            return true;
        }
        return dayjs(inscriptionEnabledFromDate, APPLICATION_DATE_FORMAT).isAfter(dayjs());
    }

    useEffect(() => {
        console.log("useEffect");
        // Sauvegarde de l'inscription
        if (result && ((apiCallDefinition?.method === "POST" && apiCallDefinition.url === INSCRIPTION_ENFANT_ENDPOINT)
            || (apiCallDefinition?.method === "PUT" && apiCallDefinition.url?.startsWith(INSCRIPTION_ENFANT_ENDPOINT)))
        ) {
            console.log("If-----");
            // Si sauvegarde ok on confirme à l'utilisateur sauf si c'est l'administrateur
            if (isAdmin) {
                console.log("Admin");
                notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
                navigate("/adminCours", { state: { application: "COURS_ENFANT" } });
            } else {
                console.log("Non adm");
                notification.open({ message: "Votre inscription a bien été enregistrée", type: "success" });
                setInscriptionFinished(result);
                resetForm();
            }
            resetApi();
        }

        // Load de l'inscription
        if (result && apiCallDefinition?.url?.startsWith(INSCRIPTION_ENFANT_ENDPOINT) && apiCallDefinition?.method === "GET") {
            const loadedInscription = result as InscriptionEnfant;
            loadedInscription.dateInscription = dayjs(loadedInscription.dateInscription, APPLICATION_DATE_TIME_FORMAT);
            loadedInscription.eleves.forEach(eleve => eleve.dateNaissance = dayjs(eleve.dateNaissance, APPLICATION_DATE_FORMAT));
            convertBooleanToOuiNon(loadedInscription.responsableLegal);
            form.setFieldsValue(loadedInscription);
            setEleves(loadedInscription.eleves);
            resetApi();
        }

        // Calcul tarif
        if (apiCallDefinition?.url === INSCRIPTION_TARIFS_ENDPOINT) {
            if (result) {
                setTarifInscription(result);
                notification.open({ message: "Votre tarif a été mis à jour (voir l'onglet Tarif)", type: "success" });
            } else if (status === HttpStatusCode.NoContent) { // No content (pas de tarif pour la période)
                notification.open({ message: "Aucun tarif n'a été trouvé pour la période en cours", type: "error" });
                setTarifInscription(undefined);
            }
            resetApi();
        }

        // Check si fonctionnalité de réinscription prioritaire activée ou si inscriptions fermées
        if (apiCallDefinition?.url === PARAM_ENDPOINT && result !== undefined) {
            const resultAsParamsDto = result as ParamsDto;
            setIsOnlyReinscriptionEnabled(resultAsParamsDto.reinscriptionPrioritaire);
            setIsInscriptionsFermees(isInscriptionFerme(resultAsParamsDto.inscriptionEnabledFromDate));
            resetApi();
        }

        // Check cohérence inscription avant enregistrement
        if (apiCallDefinition?.url === CHECK_COHERENCE_INSCRIPTION_ENDPOINT) {
            setCodeIncoherence(result);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (codeIncoherence === "ELEVE_ALREADY_EXISTS") {
            notification.open({ message: "Au moins un élève saisi figure déjà dans une autre demande d'inscription sur la même période", type: "error" });
            setCodeIncoherence(undefined);
        } else if (codeIncoherence === "NO_INCOHERENCE") {
            let { sendMailConfirmation, ...rest } = _.cloneDeep(form.getFieldsValue());
            if (!isAdmin) { // si pas en mode admin, l'envoi du mail est systématique
                sendMailConfirmation = true;
            }
            rest.eleves = _.cloneDeep(eleves);
            convertTypesBeforeBackend(rest);
            setCodeIncoherence(undefined);
            if (id) {
                setApiCallDefinition({ method: "PUT", url: INSCRIPTION_ENFANT_ENDPOINT + "/" + id, data: rest, params: { sendMailConfirmation, isAdmin: isAdmin } });
            } else {
                setApiCallDefinition({ method: "POST", url: INSCRIPTION_ENFANT_ENDPOINT, data: rest, params: { sendMailConfirmation, isAdmin: isAdmin } });
            }
        }
    }, [codeIncoherence])

    const onFinishFailed = () => {
        notification.open({ message: "Veuillez contrôler le formulaire car il y a des erreurs dans votre saisie", type: "error" });
    }

    useEffect(() => {
        // En mode admin on load l'inscription demandée
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENFANT_ENDPOINT + "/" + id });
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

    const getMessageDefilant = (type: TypeMessageDefilant) => {
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
    }

    return isInscriptionsFermees ? getMessageDefilant(TypeMessageDefilant.INSCRIPTIONS_FERMEES) :
        (
            <Form
                name="cours"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className="container-form"
                form={form}
            >
                <Spin spinning={isLoading} size="large" tip={getLoadingTip()}>
                    <InputFormItem name="id" type="hidden" formStyle={{ display: "none" }} />
                    <InputFormItem name="noInscription" type="hidden" formStyle={{ display: "none" }} />
                    <InputFormItem name="signature" formStyle={{ display: "none" }} type="hidden" />
                    <InputFormItem name="dateInscription" formStyle={{ display: "none" }} type="hidden" />
                    <InputFormItem name="anneeScolaire" formStyle={{ display: "none" }} type="hidden" />
                    {isOnlyReinscriptionEnabled && getMessageDefilant(TypeMessageDefilant.REINSCRIPTION_PRIORITAIRE)}
                    {getFormContent()}
                    <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
                </Spin>
            </Form >
        );

}