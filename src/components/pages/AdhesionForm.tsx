import { Button, Checkbox, Col, Divider, Form, Result, Row, Spin, notification } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent, useEffect, useState } from "react";
import { Adhesion } from "../../services/adhesion";
import { useLocation, useNavigate } from "react-router-dom";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT, getConsentementAdhesionLibelle, validateCodePostal, validateEmail, validateMajorite, validateMontantMinAdhesion, validatePhoneNumber } from "../../utils/FormUtils";
import { DefaultOptionType } from "antd/es/select";
import useApi from "../../hooks/useApi";
import { ADHESION_ENDPOINT, ApiCallbacks, buildUrlWithParams, handleApiCall, NEW_ADHESION_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import { TarifDto } from "../../services/tarif";
import { StatutInscription } from "../../services/inscription";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";
import dayjs from "dayjs";
import { EuroCircleOutlined } from "@ant-design/icons";


export const AdhesionForm: FunctionComponent = () => {

    const navigate = useNavigate();
    const [form] = useForm();
    const location = useLocation();
    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : undefined;
    const isAdmin = location.state ? location.state.isAdmin : undefined;
    const [versementMensuelOptions, setVersementMensuelOptions] = useState<DefaultOptionType[]>();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const { result: resultTarifs } = useApi({ method: "GET", url: TARIFS_ENDPOINT, params: { application: "ADHESION" } });
    const [autreMontantVisible, setAutreMontantVisible] = useState<boolean>(false);
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [consentementChecked, setConsentementChecked] = useState(false);

    const onFinish = async (adhesion: Adhesion) => {
        if (!isAdmin && !consentementChecked) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }
        adhesion.dateNaissance = dayjs(adhesion.dateNaissance).format(APPLICATION_DATE_FORMAT);
        if (id) {
            setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(ADHESION_ENDPOINT, { id: id }), data: adhesion });
        } else {
            setApiCallDefinition({ method: "POST", url: NEW_ADHESION_ENDPOINT, data: adhesion });
        }
    };

    const getCiviliteOptions = () => {
        return [{ value: "M", label: "Monsieur" }, { value: "MME", label: "Madame" }];
    }

    const onMontantChanged = (value: string, option: any) => {
        setAutreMontantVisible(option.label === "Autre");
    }

    const formatMontant = (montant: number) => {
        return montant + " €";
    }

    useEffect(() => {
        if (resultTarifs) {
            const resultAsTarifs = resultTarifs as TarifDto[];
            const tarifOptions: DefaultOptionType[] = [];
            resultAsTarifs.forEach(tarif => tarifOptions.push({ value: tarif.id, label: tarif.type === "FIXE" ? formatMontant(tarif.montant) : "Autre" }));
            setVersementMensuelOptions(tarifOptions);
        }
    }, [resultTarifs]);

    const apiCallbacks: ApiCallbacks = {
        [`PUT:${ADHESION_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
            navigate("/adminAdhesion");
            resetApi()
        },
        [`POST:${NEW_ADHESION_ENDPOINT}`]: (result: any) => {
            setInscriptionSuccess(true);
            form.resetFields();
            resetApi()
        },
        [`GET:${ADHESION_ENDPOINT}`]: (result: any) => {
            const adhesion = result as Adhesion;
            adhesion.dateNaissance = dayjs(adhesion.dateNaissance, APPLICATION_DATE_FORMAT);
            if (adhesion.montantAutre) {
                setAutreMontantVisible(true);
            }
            form.setFieldsValue(adhesion);
            resetApi();
        }
    };

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    useEffect(() => {
        if (id) {
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(ADHESION_ENDPOINT, { id: id }) });
        }
    }, []);

    return inscriptionSuccess ? (
        <Result
            status="success"
            title="Adhésion enregistrée"
            subTitle={(<div className="result-message">Votre adhésion a bien été enregistrée. Vous serez recontacté rapidement.</div>)}
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
                form={form}
                className="container-form"
            >
                <h2 className="adhesion-title">
                    <EuroCircleOutlined /> Devenir adhérent de l'AMC
                </h2>
                <Spin spinning={isLoading} size="large" tip="Enregistrement de votre adhésion...">
                    <Row>
                        <Col xs={24} md={12}>
                            <Divider orientation="left">Identité</Divider>
                        </Col>
                    </Row>
                    <Row gutter={[0, 0]}>
                        <Col xs={10} md={5}>
                            <SelectFormItem name="titre" label="Titre" rules={[{ required: true, message: "Veuillez saisir votre titre" }]}
                                disabled={isReadOnly} options={getCiviliteOptions()} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <InputFormItem label="Nom" name="nom" rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                                disabled={isReadOnly} />
                        </Col>
                        <Col xs={24} md={12}>
                            <InputFormItem disabled={isReadOnly} label="Prénom" name="prenom" rules={[{ required: true, message: "Veuillez saisir votre prénom" }]} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={24}>
                            <DatePickerFormItem label="Date de naissance" name="dateNaissance" rules={[{ required: true, message: "Veuillez saisir votre date de naissance" },
                            { validator: validateMajorite }
                            ]}
                                placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Divider orientation="left">Contacts</Divider>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <InputFormItem label="Numéro et rue" name="numeroEtRue" rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                                disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={14} md={8}>
                            <InputFormItem label="Code postal" name={"codePostal"} rules={[{ validator: validateCodePostal }]} disabled={isReadOnly} required />
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <InputFormItem label="Ville" name="ville" rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                                disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <InputFormItem label="Tél. mobile" name="mobile" required
                                rules={[{ validator: validatePhoneNumber }]} disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <InputFormItem label="E-mail" name="email" rules={[{ validator: validateEmail }]} disabled={isReadOnly} required />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Divider orientation="left">Versement mensuel</Divider>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={18} lg={10}>
                            <SelectFormItem name="idTarif" label="Je m'engage à verser mensuellement" rules={[{
                                required: true, message: "Veuillez saisir votre versement mensuel"
                            }]}
                                disabled={isReadOnly} options={versementMensuelOptions} onChange={onMontantChanged} />
                        </Col>
                        {autreMontantVisible && (<Col xs={24} md={10} lg={6}>
                            <InputNumberFormItem name="montantAutre" label="Montant" disabled={isReadOnly} addonAfter="€"
                                rules={[{ validator: validateMontantMinAdhesion }, { required: true, message: "Veuillez saisir le montant de votre cotisation" }]} min={1} />
                        </Col>)
                        }
                    </Row>
                    {isAdmin && (<><Divider orientation="left">Administration</Divider>
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <RadioGroupFormItem label="Statut adhésion" name="statut" disabled={isReadOnly} radioOptions={[{ value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                { value: StatutInscription.VALIDEE, label: "Validée" }]} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <InputFormItem label="Numéro de membre" name="noMembre" disabled={isReadOnly} />
                            </Col>
                        </Row>
                    </>)}
                    <Row gutter={[16, 0]}>
                        <Col span={24}>
                            {!isAdmin && (
                                <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                                    {getConsentementAdhesionLibelle()}
                                </Checkbox>
                            )}
                        </Col>
                    </Row>
                    <div style={{ textAlign: "center", marginTop: 30 }}>
                        {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                        {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon adhésion</Button>)}
                    </div>
                </Spin>
            </Form>
        );
}