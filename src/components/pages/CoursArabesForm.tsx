import { Badge, Button, Col, Form, Input, Result, Row, Spin, Tabs, TabsProps, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { INSCRIPTION_ENDPOINT, INSCRIPTION_TARIFS_ENDPOINT } from "../../services/services";
import { Inscription, SignatureDto, StatutInscription } from "../../services/inscription";
import moment, { Moment } from "moment";
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
import { convertBooleanToOuiNon, convertOuiNonToBoolean } from "../../utils/FormUtils";
import { InputFormItem } from "../common/InputFormItem";

export const CoursArabesForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementOk, setConsentementOk] = useState(false);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<string>("1");

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;

    const calculTarif = () => {
        let responsableLegal = form.getFieldValue("responsableLegal");
        if (eleves.length > 0) {
            if (!responsableLegal) {
                // Cas ou l'utilisateur arrive sur l'écran et ne saisit rien dans l'onglet responsable légal
                responsableLegal = { adherent: false };
            }
            // important, ici copier l'objet car sinon on modifie directement le formulaire
            // effet de bord => le convertOuiNonToBoolean modifie la valeur de certains champs (boolean | string) 
            // et du coup le mapping n'est plus bon dans le formulaire
            responsableLegal = { ...responsableLegal }
            convertOuiNonToBoolean(responsableLegal);
            setApiCallDefinition({ method: "POST", url: INSCRIPTION_TARIFS_ENDPOINT, data: { responsableLegal, eleves } });
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
            children: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} doCalculTarif={calculTarif} onNextStep={onNextStep} />,
        },
        {
            key: "2",
            label: <><UserOutlined />Elèves</>,
            children: <Eleves isReadOnly={isReadOnly} form={form} eleves={eleves} setEleves={setEleves} onPreviousStep={onPreviousStep}
                onNextStep={onNextStep} />,
        },
        {
            key: "3",
            label: <><EuroCircleOutlined />Tarif</>,
            children: <Tarif eleves={eleves} tarifInscription={tarifInscription} form={form} isAdmin={isAdmin} isReadOnly={isReadOnly}
                onPreviousStep={onPreviousStep} />,
        }
    ];

    const onFinish = async (inscription: Inscription) => {
        /*if (!isAdmin && !consentementOk) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }*/

        if (inscription.dateInscription) {
            inscription.dateInscription = moment(inscription.dateInscription).format("DD.MM.YYYY");
        }
        inscription.eleves = eleves;
        inscription.eleves.forEach(eleve => eleve.dateNaissance = (eleve.dateNaissance as Moment).format("DD.MM.YYYY"));
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
                setInscriptionSuccess(true);
                resetForm();
            }
            resetApi();
        }

        // Load de l'inscription
        if (result && apiCallDefinition?.method === "GET") {
            const loadedInscription = result as Inscription;
            loadedInscription.dateInscription = moment(loadedInscription.dateInscription, 'DD.MM.YYYY');
            loadedInscription.eleves.forEach(eleve => eleve.dateNaissance = moment(eleve.dateNaissance, 'DD.MM.YYYY'));
            convertBooleanToOuiNon(loadedInscription.responsableLegal);
            form.setFieldsValue(loadedInscription);
            setEleves(loadedInscription.eleves);
            resetApi();
        }

        // Calcul tarif
        if (result && apiCallDefinition?.url === INSCRIPTION_TARIFS_ENDPOINT) {
            setTarifInscription(result);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT + "/" + id });
        }
    }, []);

    useEffect(() => {
        calculTarif();
    }, [eleves.length]);


    return (
        <Form
            name="cours"
            onFinish={onFinish}
            autoComplete="off"
            className="container-form"
            form={form}
        >
            <InputFormItem name="id" type="hidden" style={{ display: "none" }} />
            <InputFormItem name="signature" style={{ display: "none" }} type="hidden" />
            <InputFormItem name="dateInscription" style={{ display: "none" }} type="hidden" />
            {inscriptionSuccess && (<Result
                status="success"
                title="Inscription enregistré"
                subTitle="Votre inscription a bien été enregistrée. Vous serez recontacté rapidement."
                extra={[
                    <Button type="primary" onClick={() => setInscriptionSuccess(false)}>
                        Nouvelle inscription
                    </Button>]}
            />)
            }

            {!inscriptionSuccess && (
                <>
                    <Spin spinning={isLoading} className="container-full-width" >
                        <Tabs tabBarExtraContent centered activeKey={activeStep} items={tabItems} onChange={onStepChanged} />
                    </Spin>
                </>
            )}
            <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
        </Form >
    );

}