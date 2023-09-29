import { Button, Col, DatePicker, Divider, Form, Input, Modal, Radio, Row, Switch } from "antd";
import { FunctionComponent, useEffect } from "react";
import { INSCRIPTION_ENDPOINT } from "../../services/services";
import { Inscription, StatutInscription } from "../../services/inscription";
import moment from "moment";
import useApi from "../../services/useApi";
import { useLocation } from "react-router-dom";
import { useForm } from "antd/es/form/Form";

type FieldType = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    telephone: string;
    email: string;
    sexe: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    statut: StatutInscription;
};

export const InscriptionForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition } = useApi();
    const location = useLocation();
    const [form] = useForm();

    let id: any, isReadOnly, isAdmin;
    if (location.state) {
        id = location.state.id;
        isReadOnly = location.state.isReadOnly;
        isAdmin = location.state.isAdmin;
    }

    const onFinish = async (inscription: Inscription) => {
        inscription.dateNaissance = moment(inscription.dateNaissance).format("DD.MM.YYYY");
        if (!inscription.statut) {
            inscription.statut = StatutInscription.PROVISOIRE;
        }
        setApiCallDefinition({ method: "POST", url: INSCRIPTION_ENDPOINT, data: inscription });
    };

    useEffect(() => {
        if (result && apiCallDefinition?.method === "POST" && (result as Inscription).id) {
            Modal.success({
                title: "Inscription prise en compte",
                content: "Votre inscription a bien été enregistrée"
            });
        }

        if (result && apiCallDefinition?.method === "GET") {
            const loadedInscription = result as Inscription;
            loadedInscription.dateNaissance = moment(loadedInscription.dateNaissance, 'DD.MM.YYYY')
            form.setFieldsValue(result);
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT + id });
        }
    }, [id]);

    return (<Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        autoComplete="off"
        className="container-form"
        form={form}
    >
        <Form.Item<FieldType> name="id" style={{ display: "none" }}>
            <Input type="hidden" />
        </Form.Item>
        <Form.Item<FieldType> name="statut" style={{ display: "none" }}>
            <Input type="hidden" />
        </Form.Item>
        <Row>
            <Col span={24}>
                <Divider orientation="left">Identité</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Nom"
                    name="nom"
                    rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                >
                    <Input className="input" readOnly={isReadOnly} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Prénom"
                    name="prenom"
                    rules={[{ required: true, message: "Veuillez saisir votre prénom" }]}
                >
                    <Input readOnly={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Date de naissance"
                    name="dateNaissance"
                    rules={[{ required: true, message: "Veuillez saisir votre date de naissance" }]}
                >
                    <DatePicker disabled={isReadOnly} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Sexe"
                    name="sexe"
                    rules={[{ required: true, message: "Veuillez saisir votre sexe" }]}
                >
                    <Radio.Group disabled={isReadOnly} >
                        <Radio value="H">Homme</Radio>
                        <Radio value="F">Femme</Radio>
                    </Radio.Group>
                </Form.Item>
            </Col>
        </Row>
        <br />
        <Row>
            <Col span={24}>
                <Divider orientation="left">Contact</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="E-mail"
                    name="email"
                    rules={[{ required: true, message: "Veuillez saisir votre adresse e-mail" }]}
                >
                    <Input readOnly={isReadOnly} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Téléphone"
                    name="telephone"
                    rules={[{ required: true, message: "Veuillez saisir votre téléphone" }]}
                >
                    <Input readOnly={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <br />
        <Row>
            <Col span={24}>
                <Divider orientation="left">Adresse postale</Divider>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Numéro et rue"
                    name="numeroEtRue"
                    rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                >
                    <Input readOnly={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[16, 32]}>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Code postal"
                    name="codePostal"
                    rules={[{ required: true, message: "Veuillez saisir votre code postal" }]}
                >
                    <Input readOnly={isReadOnly} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Ville"
                    name="ville"
                    rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                >
                    <Input readOnly={isReadOnly} />
                </Form.Item>
            </Col>
        </Row>
        {isAdmin &&
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <Form.Item<FieldType>
                        label="Statut"
                        name="statut"
                        rules={[{ required: true, message: "Veuillez saisir le statut" }]}
                    >
                        <Switch disabled={isReadOnly} />
                    </Form.Item>
                </Col>
            </Row>
        }
        <Row gutter={[16, 32]}>
            <Col span={24} className="centered-content">
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        S'inscrire
                    </Button>
                </Form.Item>
            </Col>
        </Row>
    </Form>);

}