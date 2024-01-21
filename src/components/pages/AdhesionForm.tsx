import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, Radio, Result, Row, Select, notification } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent, useEffect, useState } from "react";
import { Adhesion, AdhesionLight } from "../../services/adhesion";
import { useLocation, useNavigate } from "react-router-dom";
import { onNumericFieldChanged } from "../../utils/FormUtils";
import { DefaultOptionType } from "antd/es/select";
import useApi from "../../hooks/useApi";
import { ADHESION_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import { TarifDto } from "../../services/tarif";
import moment, { Moment } from "moment";
import { StatutInscription } from "../../services/inscription";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";


export const AdhesionForm: FunctionComponent = () => {

    const navigate = useNavigate();
    const [form] = useForm();
    const location = useLocation();
    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;
    const [versementMensuelOptions, setVersementMensuelOptions] = useState<DefaultOptionType[]>();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const { result: resultTarifs } = useApi({ method: "GET", url: TARIFS_ENDPOINT, params: { application: "ADHESION" } });
    const [autreMontantVisible, setAutreMontantVisible] = useState<boolean>(false);
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);

    const onFinish = async (adhesion: Adhesion) => {
        /*if (!isAdmin && !consentementOk) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }*/
        if (adhesion.dateInscription) {
            adhesion.dateInscription = (adhesion.dateInscription as Moment).format("DD.MM.YYYY");
        }
        adhesion.dateNaissance = (adhesion.dateNaissance as Moment).format("DD.MM.YYYY");
        setApiCallDefinition({ method: "POST", url: ADHESION_ENDPOINT, data: adhesion });
    };

    const getCiviliteOptions = () => {
        return [{ value: "M", label: "Monsieur" }, { value: "MME", label: "Madame" }];
    }

    const onMontantChanged = (value: string, option: any) => {
        setAutreMontantVisible(option.label === "Autre");
    }

    useEffect(() => {
        if (resultTarifs) {
            const resultAsTarifs = resultTarifs as TarifDto[];
            const tarifOptions: DefaultOptionType[] = [];
            resultAsTarifs.forEach(tarif => tarifOptions.push({ value: tarif.id, label: tarif.type === "FIXE" ? tarif.montant : "Autre" }));
            setVersementMensuelOptions(tarifOptions);
        }
    }, [resultTarifs]);


    useEffect(() => {
        if (apiCallDefinition?.url === ADHESION_ENDPOINT && apiCallDefinition.method === "POST" && result) {
            if (isAdmin) {
                notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
                navigate("/adminAdhesion");
            } else {
                setInscriptionSuccess(true);
            }
            resetApi();
        }
        if (apiCallDefinition?.method === "GET" && result) { // load de l'adhésion
            const adhesion = result as Adhesion;
            console.log(adhesion);
            adhesion.dateInscription = moment(adhesion.dateInscription, 'DD.MM.YYYY');
            adhesion.dateNaissance = moment(adhesion.dateNaissance, 'DD.MM.YYYY');
            if (adhesion.montantAutre) {
                setAutreMontantVisible(true);
            }
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
                name="adhesion"
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
                        <SelectFormItem name="titre" label="Titre" rules={[{ required: true, message: "Veuillez saisir votre titre" }]}
                            disabled={isReadOnly} options={getCiviliteOptions()} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem label="Nom" name="nom" rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                            disabled={isReadOnly} />
                    </Col>
                    <Col span={12}>
                        <InputFormItem disabled={isReadOnly} label="Prénom" name="prenom" rules={[{ required: true, message: "Veuillez saisir votre prénom" }]} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <DatePickerFormItem label="Date de naissance" name="dateNaissance" rules={[{ required: true, message: "Veuillez saisir votre date de naissance" }]}
                            placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Contacts</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem label="Numéro et rue" name="numeroEtRue" rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                            disabled={isReadOnly} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem label="Code postal" name={"codePostal"} rules={[{ required: true, message: "Veuillez saisir votre code postal" },
                        { pattern: /^\d{5}$/, message: "Veuillez saisir un code postale valide", validateTrigger: "onSubmit" }]}
                            disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                    </Col>
                    <Col span={12}>
                        <InputFormItem label="Ville" name="ville" rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                            disabled={isReadOnly} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem label="Téléphone fixe" name="telephone"
                            rules={[{ required: true, message: "Veuillez saisir votre téléphone fixe" },
                            { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }
                            ]} disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                    </Col>
                    <Col span={12}>
                        <Form.Item

                        >
                            <InputFormItem label="Mobile" name="mobile"
                                rules={[{ required: true, message: "Veuillez saisir votre téléphone mobile" },
                                { pattern: /^\d{10}$/, message: "Veuillez saisir un numéro de téléphone valide", validateTrigger: "onSubmit" }]} disabled={isReadOnly} onKeyDown={onNumericFieldChanged} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem label="E-mail" name="email" rules={[{ required: true, message: "Veuillez saisir votre adresse e-mail" },
                        { type: "email", message: "Veuillez saisir une adresse e-mail valide", validateTrigger: "onSubmit" }
                        ]} disabled={isReadOnly} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Divider orientation="left">Versement mensuel</Divider>
                    </Col>
                </Row>
                <Row gutter={[0, 32]}>
                    <Col span={12}>
                        <SelectFormItem name="idTarif" label="Je m'engage à verser mensuellement" rules={[{ required: true, message: "Veuillez saisir votre versement mensuel" }]}
                            disabled={isReadOnly} options={versementMensuelOptions} onChange={onMontantChanged} />
                    </Col>
                    {autreMontantVisible && <Col span={12}>
                        <InputNumberFormItem name="montantAutre" label="Montant" disabled={isReadOnly}
                            rules={[{ required: true, message: "Veuillez saisir le montant" }]} />
                    </Col>
                    }
                </Row>
                {isAdmin && (<><Divider orientation="left">Statut</Divider>
                    <Row gutter={[16, 32]}>
                        <Col span={12}>
                            <RadioGroupFormItem label="Statut adhésion" name="statut" disabled={isReadOnly} radioOptions={[{ value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                            { value: StatutInscription.VALIDEE, label: "Validée" }]} />
                        </Col>
                    </Row>
                </>)}
                <Row>
                    {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                    {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon adhésion</Button>)}
                </Row>
            </Form>
        );
}