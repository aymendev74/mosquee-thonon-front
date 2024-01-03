import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, Result, Row, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent, useEffect, useState } from "react";
import { Adhesion, AdhesionLight } from "../../services/adhesion";
import { useLocation } from "react-router-dom";
import { onNumericFieldChanged } from "../../utils/FormUtils";
import { DefaultOptionType } from "antd/es/select";
import useApi from "../../hooks/useApi";
import { ADHESION_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import { TarifDto } from "../../services/tarif";
import moment from "moment";


export const AdhesionForm: FunctionComponent = () => {

    const [form] = useForm();
    const location = useLocation();
    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;
    const [versementMensuelOptions, setVersementMensuelOptions] = useState<DefaultOptionType[]>();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [autreMontantVisible, setAutreMontantVisible] = useState<boolean>(false);
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);

    const onFinish = async (adhesion: Adhesion) => {
        /*if (!isAdmin && !consentementOk) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }*/
        if (adhesion.dateInscription) {
            adhesion.dateInscription = moment(adhesion.dateInscription).format("DD.MM.YYYY");
        }
        adhesion.dateNaissance = moment(adhesion.dateNaissance).format("DD.MM.YYYY");
        setApiCallDefinition({ method: "POST", url: ADHESION_ENDPOINT, data: adhesion });
    };

    const getCiviliteOptions = () => {
        return [{ value: "M", label: "Monsieur" }, { value: "MME", label: "Madame" }];
    }

    const onMontantChanged = (value: string, option: any) => {
        setAutreMontantVisible(option.label === "Autre");
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: TARIFS_ENDPOINT, params: { application: "ADHESION" } });
    }, []);


    useEffect(() => {
        if (apiCallDefinition?.url === TARIFS_ENDPOINT && result) {
            const resultAsTarifs = result as TarifDto[];
            const tarifOptions: DefaultOptionType[] = [];
            resultAsTarifs.forEach(tarif => tarifOptions.push({ value: tarif.id, label: tarif.type === "FIXE" ? tarif.montant : "Autre" }));
            setVersementMensuelOptions(tarifOptions);
            resetApi();
        }
        if (apiCallDefinition?.url === ADHESION_ENDPOINT && apiCallDefinition.method === "POST" && result) {
            setInscriptionSuccess(true);
            resetApi();
        }
        if (apiCallDefinition?.method === "GET" && result) { // load de l'adhésion
            const adhesion = result as Adhesion;
            adhesion.dateInscription = moment(adhesion.dateInscription, 'DD.MM.YYYY');
            adhesion.dateNaissance = moment(adhesion.dateNaissance, 'DD.MM.YYYY');
            form.setFieldsValue(adhesion);
            resetApi();
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: ADHESION_ENDPOINT + "/" + id });
        }
    }, []);

    return inscriptionSuccess ? (
        <Result
            status="success"
            title="Adhésion enregistrée"
            subTitle="Votre adhésion a bien été enregistrée. Vous serez recontacté rapidement."
            extra={[
                <Button type="primary" onClick={() => setInscriptionSuccess(false)}>
                    Nouvelle adhésion
                </Button>]}
        />) :
        (
            <Form
                name="basic"
                onFinish={onFinish}
                autoComplete="off"
                className="container-form"
                form={form}
            >
                <Form.Item name="id" style={{ display: "none" }}>
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item name="signature" style={{ display: "none" }}>
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item name="dateInscription" style={{ display: "none" }}>
                    <Input type="hidden" />
                </Form.Item>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Identité</Divider>
                    </Col>
                </Row>
                <Row gutter={[0, 32]}>
                    <Col span={6}>
                        <Form.Item
                            name="titre"
                            label="Titre"
                            rules={[{ required: true, message: "Veuillez saisir votre titre" }]}>
                            <Select disabled={isReadOnly} options={getCiviliteOptions()} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item
                            label="Nom"
                            name={["nom"]}
                            rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Prénom"
                            name={["prenom"]}
                            rules={[{ required: true, message: "Veuillez saisir votre prénom" }]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <Form.Item
                            label="Date de naissance"
                            name="dateNaissance"
                            rules={[{ required: true, message: "Veuillez saisir votre date de naissance" }]}
                        >
                            <DatePicker placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Contacts</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item
                            label="Numéro et rue"
                            name={["numeroEtRue"]}
                            rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item
                            label="Code postal"
                            name={["codePostal"]}
                            rules={[{ required: true, message: "Veuillez saisir votre code postal" },
                            { pattern: /^\d{5}$/, message: "Veuillez saisir un code postale valide", validateTrigger: "onSubmit" }]}
                        >
                            <Input disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Ville"
                            name={["ville"]}
                            rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item
                            label="Téléphone fixe"
                            name={["telephone"]}
                            rules={[{ required: true, message: "Veuillez saisir votre téléphone fixe" },
                            { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }
                            ]}
                        >
                            <Input disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Mobile"
                            name={["mobile"]}
                            rules={[{ required: true, message: "Veuillez saisir votre téléphone mobile" },
                            { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }]}
                        >
                            <Input disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <Form.Item
                            label="E-mail"
                            name={["email"]}
                            rules={[{ required: true, message: "Veuillez saisir votre adresse e-mail" },
                            { type: "email", message: "Veuillez saisir une adresse e-mail valide", validateTrigger: "onSubmit" }
                            ]}
                        >
                            <Input disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Versement mensuel</Divider>
                    </Col>
                </Row>
                <Row gutter={[0, 32]}>
                    <Col span={12}>
                        <Form.Item
                            name="idTarif"
                            label="Je m'engage à verser mensuellement"
                            rules={[{ required: true, message: "Veuillez saisir votre versement mensuel" }]}>
                            <Select disabled={isReadOnly} options={versementMensuelOptions} onChange={onMontantChanged} />
                        </Form.Item>
                    </Col>
                    {autreMontantVisible && <Col span={12}>
                        <Form.Item
                            name="montantAutre"
                            label="Montant"
                            rules={[{ required: true, message: "Veuillez saisir le montant" }]}>
                            <InputNumber disabled={isReadOnly} />
                        </Form.Item>
                    </Col>
                    }
                </Row>
                <Row>
                    {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                    {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon adhésion</Button>)}
                </Row>
            </Form>
        );
}