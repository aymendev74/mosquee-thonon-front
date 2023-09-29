import { Button, Col, DatePicker, Divider, Form, Input, Modal, Radio, Row } from "antd";
import { FunctionComponent, useEffect } from "react";
import { INSCRIPTION_ENDPOINT } from "../../services/services";
import { Inscription, StatutInscription } from "../../services/inscription";
import moment from "moment";
import useApi from "../../services/useApi";

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

    const { result, setApiCallDefinition } = useApi();

    const onFinish = async (inscription: Inscription) => {
        inscription.dateNaissance = moment(inscription.dateNaissance).format("DD.MM.YYYY");
        if (!inscription.statut) {
            inscription.statut = StatutInscription.PROVISOIRE;
        }
        setApiCallDefinition({ method: "POST", url: INSCRIPTION_ENDPOINT, data: inscription });
    };

    useEffect(() => {
        if (result && (result as Inscription).id) {
            Modal.success({
                title: "Inscription prise en compte",
                content: "Votre inscription a bien été enregistrée"
            });
        }
    }, [result]);

    return (<Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        autoComplete="off"
        className="container-form"
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
                    <Input className="input" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Prénom"
                    name="prenom"
                    rules={[{ required: true, message: "Veuillez saisir votre prénom" }]}
                >
                    <Input />
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
                    <DatePicker />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Sexe"
                    name="sexe"
                    rules={[{ required: true, message: "Veuillez saisir votre sexe" }]}
                >
                    <Radio.Group>
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
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Téléphone"
                    name="telephone"
                    rules={[{ required: true, message: "Veuillez saisir votre téléphone" }]}
                >
                    <Input />
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
                    <Input />
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
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item<FieldType>
                    label="Ville"
                    name="ville"
                    rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                >
                    <Input />
                </Form.Item>
            </Col>
        </Row>
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