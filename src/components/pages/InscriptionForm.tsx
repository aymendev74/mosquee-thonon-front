import { Button, Col, Form, Input, Row, Spin, Tabs, TabsProps, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { INSCRIPTION_ENDPOINT, INSCRIPTION_TARIFS } from "../../services/services";
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

export const InscriptionForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementOk, setConsentementOk] = useState(false);
    const [eleves, setEleves] = useState<Eleve[]>([]);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();

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
            setApiCallDefinition({ method: "POST", url: INSCRIPTION_TARIFS, data: { responsableLegal, eleves } });
        } else {
            setTarifInscription(undefined);
        }
    };

    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Responsable légal',
            children: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} doCalculTarif={calculTarif} />,
        },
        {
            key: '2',
            label: 'Eleves',
            children: <Eleves isReadOnly={isReadOnly} form={form} eleves={eleves} setEleves={setEleves} />,
        },
        {
            key: '3',
            label: 'Tarif',
            children: <Tarif eleves={eleves} tarifInscription={tarifInscription} form={form} />,
        }];

    const onFinish = async (inscription: Inscription) => {
        /*if (!isAdmin && !consentementOk) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }*/

        inscription.dateInscription = moment(inscription.dateInscription).format("DD.MM.YYYY");
        inscription.eleves = eleves;
        inscription.eleves.forEach(eleve => eleve.dateNaissance = (eleve.dateNaissance as Moment).format("DD.MM.YYYY"));
        if (!inscription.statut) {
            inscription.statut = StatutInscription.PROVISOIRE;
        }
        setApiCallDefinition({ method: "POST", url: INSCRIPTION_ENDPOINT, data: inscription });
    };

    useEffect(() => {
        // Sauvegarde de l'inscription
        if (result && apiCallDefinition?.method === "POST" && apiCallDefinition.url === INSCRIPTION_ENDPOINT && (result as Inscription).id) {
            // Si sauvegarde ok on confirme à l'utilisateur sauf si c'est l'administrateur
            if (isAdmin) {
                notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
                navigate("/administration");
            } else {
                notification.open({ message: "Votre inscription a bien été enregistrée", type: "success" });
                form.resetFields();
            }
            resetApi();
        }

        // Load de l'inscription
        if (result && apiCallDefinition?.method === "GET") {
            const loadedInscription = result as Inscription;
            loadedInscription.dateInscription = moment(loadedInscription.dateInscription, 'DD.MM.YYYY');
            loadedInscription.eleves.forEach(eleve => eleve.dateNaissance = moment(eleve.dateNaissance, 'DD.MM.YYYY'));
            form.setFieldsValue(result);
            resetApi();
        }

        // Calcul tarif
        if (result && apiCallDefinition?.url === INSCRIPTION_TARIFS) {
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
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            autoComplete="off"
            className="container-form"
            form={form}
        >
            <Form.Item name="id" style={{ display: "none" }}>
                <Input type="hidden" />
            </Form.Item>
            <Form.Item name="statut" style={{ display: "none" }}>
                <Input type="hidden" />
            </Form.Item>
            <Form.Item name="signature" style={{ display: "none" }}>
                <Input type="hidden" />
            </Form.Item>
            <Spin spinning={isLoading} className="container-full-width" >
                <Tabs defaultActiveKey="1" items={tabItems} />
            </Spin>
            <Row gutter={[16, 32]}>
                <Col span={24} className="centered-content m-top-15">
                    <Form.Item>
                        {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                        {!isAdmin && (<Button type="primary" htmlType="submit">S'inscrire</Button>)}
                    </Form.Item>
                </Col>
            </Row>
            <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
        </Form >
    );

}