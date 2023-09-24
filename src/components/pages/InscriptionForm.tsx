import { Button, Col, DatePicker, Form, Input, Modal, Radio, Row } from "antd";
import { FunctionComponent } from "react";
import { saveInscription } from "../../services/services";
import { Inscription } from "../../services/inscription";
import moment from "moment";

type FieldType = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    telephone: string;
    email: string;
    sexe: string;
};

export const InscriptionForm: FunctionComponent = () => {

    const onFinish = async (inscription: Inscription) => {
        inscription.dateNaissance = moment(inscription.dateNaissance).format("DD.MM.YYYY");
        console.log(inscription);
        inscription = await saveInscription(inscription);
        if (inscription && inscription.id) {
            Modal.success({
                title: "Inscription prise en compte",
                content: "Votre inscription a bien été enregistrée"
            });
        }
    };

    return (<Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="container-form"
    >
        <Form.Item<FieldType> name="id" style={{ display: "none" }}>
            <Input type="hidden" />
        </Form.Item>
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