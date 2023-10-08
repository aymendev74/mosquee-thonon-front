import { Button, Col, DatePicker, Divider, Form, Input, Radio, Row, Spin, notification } from "antd";
import { ChangeEvent, FunctionComponent, useEffect, useRef } from "react";
import { INSCRIPTION_ENDPOINT } from "../../services/services";
import { Inscription, SignatureDto, StatutInscription } from "../../services/inscription";
import moment from "moment";
import useApi from "../../hooks/useApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import { RuleObject } from "antd/es/form";
import { StoreValue } from "antd/es/form/interface";

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
    signature: SignatureDto;
};

export const InscriptionForm: FunctionComponent = () => {

    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const location = useLocation();
    const [form] = useForm();
    const navigate = useNavigate();

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;

    const onFinish = async (inscription: Inscription) => {
        inscription.dateNaissance = moment(inscription.dateNaissance).format("DD.MM.YYYY");
        if (!inscription.statut) {
            inscription.statut = StatutInscription.PROVISOIRE;
        }
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
            loadedInscription.dateNaissance = moment(loadedInscription.dateNaissance, 'DD.MM.YYYY')
            form.setFieldsValue(result);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT + "/" + id });
        }
    }, []);

    const onCodePostalChanged = (e: any) => {
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
            <Spin spinning={isLoading} className="container-full-width" >
                <Form.Item<FieldType> name="id" style={{ display: "none" }}>
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item<FieldType> name="statut" style={{ display: "none" }}>
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item<FieldType> name="signature" style={{ display: "none" }}>
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
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Prénom"
                            name="prenom"
                            rules={[{ required: true, message: "Veuillez saisir votre prénom" }]}
                        >
                            <Input disabled={isReadOnly} />
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
                            <DatePicker placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
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
                            rules={[{ required: true, message: "Veuillez saisir votre adresse e-mail" },
                            { type: "email", message: "Veuillez saisir une adresse e-mail valide", validateTrigger: "onSubmit" }
                            ]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Téléphone"
                            name="telephone"
                            rules={[{ required: true, message: "Veuillez saisir votre téléphone" }]}
                        >
                            <Input disabled={isReadOnly} />
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
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Code postal"
                            name="codePostal"
                            rules={[{ required: true, message: "Veuillez saisir votre code postal" },
                            { pattern: /^\d{5}$/, message: "Veuillez saisir un code postale valide", validateTrigger: "onSubmit" }]}
                        >
                            <Input disabled={isReadOnly} onKeyDown={onCodePostalChanged} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Ville"
                            name="ville"
                            rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                {
                    isAdmin &&
                    <>
                        <Row>
                            <Col span={24}>
                                <Divider orientation="left">Statut inscription</Divider>
                            </Col>
                        </Row>
                        <Row gutter={[16, 32]}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Statut"
                                    name="statut"
                                >
                                    <Radio.Group disabled={isReadOnly} >
                                        <Radio value={StatutInscription.PROVISOIRE}>Provisoire</Radio>
                                        <Radio value={StatutInscription.VALIDEE}>Validée</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                }
                <Row gutter={[16, 32]}>
                    <Col span={24} className="centered-content">
                        <Form.Item>
                            {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                            {!isAdmin && (<Button type="primary" htmlType="submit">S'inscrire</Button>)}
                        </Form.Item>
                    </Col>
                </Row>
            </Spin>
        </Form >
    );

}