import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, Radio, Row, Spin, Tabs, TabsProps, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { INSCRIPTION_ENDPOINT } from "../../services/services";
import { Inscription, SignatureDto, StatutInscription } from "../../services/inscription";
import moment from "moment";
import useApi from "../../hooks/useApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import { ModaleRGPD } from "../modals/ModalRGPD";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { ResponsableLegal } from "../inscriptions/ResponsableLegal";
import { Eleves } from "../inscriptions/Eleves";
import { Eleve } from "../../services/eleve";

export const InscriptionForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();
    const [modalRGPDOpen, setModalRGPDOpen] = useState(false);
    const [consentementOk, setConsentementOk] = useState(false);
    const [eleves, setEleves] = useState<Eleve[]>([]);

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;


    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Responsable légal',
            children: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} />,
        },
        {
            key: '2',
            label: 'Eleves',
            children: <Eleves isReadOnly={isReadOnly} form={form} eleves={eleves} setEleves={setEleves} />,
        }];

    const onFinish = async (inscription: Inscription) => {
        /*if (!isAdmin && !consentementOk) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }*/

        inscription.dateInscription = moment(inscription.dateInscription).format("DD.MM.YYYY");
        inscription.eleves = eleves;
        console.log(eleves);
        inscription.eleves.forEach(eleve => eleve.dateNaissance = moment(eleve.dateNaissance).format("DD.MM.YYYY"));
        if (!inscription.statut) {
            inscription.statut = StatutInscription.PROVISOIRE;
        }
        console.log(inscription);
        setApiCallDefinition({ method: "POST", url: INSCRIPTION_ENDPOINT, data: inscription });
    };

    useEffect(() => {
        if (result && apiCallDefinition?.method === "POST" && (result as Inscription).id) {
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

        if (result && apiCallDefinition?.method === "GET") {
            const loadedInscription = result as Inscription;
            loadedInscription.dateInscription = moment(loadedInscription.dateInscription, 'DD.MM.YYYY');
            loadedInscription.eleves.forEach(eleve => eleve.dateNaissance = moment(eleve.dateNaissance, 'DD.MM.YYYY'));
            form.setFieldsValue(result);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT + "/" + id });
        }
    }, []);

    const onNumericFieldChanged = (e: any) => {
        if (!["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"].includes(e.key) && isNaN(e.key)) {
            e.preventDefault();
        }
    }

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