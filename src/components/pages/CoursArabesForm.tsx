import { Badge, Button, Col, Form, Input, Result, Row, Spin, Tabs, TabsProps, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { INSCRIPTION_ENDPOINT, INSCRIPTION_TARIFS_ENDPOINT, PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT } from "../../services/services";
import { Inscription, StatutInscription } from "../../services/inscription";
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
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT, convertBooleanToOuiNon, convertOuiNonToBoolean } from "../../utils/FormUtils";
import { InputFormItem } from "../common/InputFormItem";
import { HttpStatusCode } from "axios";
import dayjs from "dayjs";

export const CoursArabesForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading, status } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionFinished, setInscriptionFinished] = useState<Inscription>();
    const [isOnlyReinscriptionEnabled, setIsOnlyReinscriptionEnabled] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<string>("1");

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;

    const calculTarif = () => {
        let adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        if (eleves.length > 0) {
            const nbEleves = eleves.length;
            const atDate = form.getFieldValue("dateInscription");
            setApiCallDefinition({ method: "POST", url: INSCRIPTION_TARIFS_ENDPOINT, data: { adherent: adherent ?? false, nbEleves, atDate } });
        } else {
            setTarifInscription(undefined);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setEleves([]);
    }

    const onPreviousStep = () => {
        const newActiveStep = Number(activeStep) - 1;
        setActiveStep(String(newActiveStep));
    }

    const onNextStep = () => {
        const newActiveStep = Number(activeStep) + 1;
        setActiveStep(String(newActiveStep));
    }

    const onStepChanged = (activeKey: string) => {
        setActiveStep(activeKey);
    }

    const tabItems: TabsProps['items'] = [
        {
            key: "1",
            label: <><InfoCircleOutlined />Responsable légal</>,
            children: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} doCalculTarif={calculTarif} onNextStep={onNextStep} form={form} />,
        },
        {
            key: "2",
            label: <><UserOutlined />Elèves</>,
            children: <Eleves isReadOnly={isReadOnly} isAdmin={isAdmin} form={form} eleves={eleves} setEleves={setEleves} onPreviousStep={onPreviousStep}
                onNextStep={onNextStep} />,
        },
        {
            key: "3",
            label: <><EuroCircleOutlined />Tarif</>,
            children: <Tarif eleves={eleves} tarifInscription={tarifInscription} form={form} isAdmin={isAdmin} isReadOnly={isReadOnly}
                onPreviousStep={onPreviousStep} consentementChecked={consentementChecked} setConsentementChecked={setConsentementChecked} />,
        }
    ];

    const onFinish = async (inscription: Inscription) => {
        if (!isAdmin && !consentementChecked) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }
        if (inscription.responsableLegal.adherent == undefined) {
            inscription.responsableLegal.adherent = false;
        }
        if (inscription.dateInscription) {
            inscription.dateInscription = dayjs(inscription.dateInscription).format(APPLICATION_DATE_TIME_FORMAT);
        }
        inscription.eleves = eleves;
        inscription.eleves.forEach(eleve => eleve.dateNaissance = dayjs(eleve.dateNaissance).format(APPLICATION_DATE_FORMAT));
        convertOuiNonToBoolean(inscription.responsableLegal);
        setApiCallDefinition({ method: "POST", url: INSCRIPTION_ENDPOINT, data: inscription });
    };

    useEffect(() => {
        // Sauvegarde de l'inscription
        if (result && apiCallDefinition?.method === "POST" && apiCallDefinition.url === INSCRIPTION_ENDPOINT && (result as Inscription).id) {
            // Si sauvegarde ok on confirme à l'utilisateur sauf si c'est l'administrateur
            if (isAdmin) {
                notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
                navigate("/adminCours");
            } else {
                notification.open({ message: "Votre inscription a bien été enregistrée", type: "success" });
                setInscriptionFinished(result);
                resetForm();
            }
            resetApi();
        }

        // Load de l'inscription
        if (result && apiCallDefinition?.url?.startsWith(INSCRIPTION_ENDPOINT) && apiCallDefinition?.method === "GET") {
            const loadedInscription = result as Inscription;
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
            }
            resetApi();
        }

        // Check si fonctionnalité de réinscription prioritaire activée
        if (apiCallDefinition?.url === PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT && result !== undefined) {
            setIsOnlyReinscriptionEnabled(result);
            resetApi();
        }
    }, [result]);

    const onFinishFailed = () => {
        notification.open({ message: "Veuillez contrôler le formulaire car il y a des erreurs dans votre saisie", type: "error" });
    }

    useEffect(() => {
        // En mode admin on load l'inscription demandée
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT + "/" + id });
        } else { // Sinon on va simplement vérifier si les réinscriptions prioritaires sont activées
            setApiCallDefinition({ method: "GET", url: PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT })
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
        return inscriptionFinished ? getResult() : (<Tabs tabBarExtraContent centered activeKey={activeStep} items={tabItems} onChange={onStepChanged} />);
    }

    const getLoadingTip = () => {
        if (apiCallDefinition?.url === PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT) {
            return "Initialisation de l'application...";
        } else if (apiCallDefinition?.method === "POST" && apiCallDefinition.url === INSCRIPTION_ENDPOINT) {
            return "Enregistrement de votre inscription en cours...";
        } else {
            return "Chargement...";
        }
    }

    const getMessageReinscriptionPrioritaire = () => {
        return (
            <div className="message-scroll-container">
                <div className="message-scroll">
                    Actuellement, seules les réinscriptions sont autorisées. Vous pouvez vous inscrire pour l'année prochaine, uniquement si vous étiez déjà inscrit pendant
                    la dernière année scolaire. Les inscriptions pour les nouveaux élèves seront ouvertes ultérieurement.
                </div>
            </div>
        );
    };

    return (
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
                {isOnlyReinscriptionEnabled && getMessageReinscriptionPrioritaire()}
                {getFormContent()}
                <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
            </Spin>
        </Form >
    );

}