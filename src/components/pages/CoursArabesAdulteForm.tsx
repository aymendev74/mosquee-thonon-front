import { Button, Checkbox, Col, Divider, Form, Popover, Result, Row, Spin, notification } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getConsentementInscriptionCoursLibelle, isInscriptionFerme, prepareInscriptionAdulteBeforeForm, prepareInscriptionAdulteBeforeSave, validateCodePostal, validateEmail, validateMajorite, validateMontantMinAdhesion, validatePhoneNumber } from "../../utils/FormUtils";
import useApi from "../../hooks/useApi";
import { ApiCallbacks, buildUrlWithParams, handleApiCall, INSCRIPTION_ADULTE_ENDPOINT, INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT, NEW_INSCRIPTION_ADULTE_ENDPOINT, NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT, PARAM_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import { InscriptionAdulteBack, InscriptionAdulteFront, StatutInscription } from "../../services/inscription";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";
import { Sexe } from "../../services/eleve";
import { SelectFormItem } from "../common/SelectFormItem";
import { getNiveauInterneAdulteOptions, getStatutsProfessionnelsOptions } from "../common/commoninputs";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import { TarifInscriptionDto } from "../../services/tarif";
import { HttpStatusCode } from "axios";
import { ParamsDtoB } from "../../services/parametres";


export const CoursArabesAdulteForm: FunctionComponent = () => {

    const navigate = useNavigate();
    const [form] = useForm();
    const location = useLocation();
    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : false;
    const isAdmin = location.state ? location.state.isAdmin : false;
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading, status } = useApi();
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);

    const onFinish = async (inscription: InscriptionAdulteFront) => {
        const inscriptionToSave = prepareInscriptionAdulteBeforeSave(inscription);
        let sendMailConfirmation = inscription.sendMailConfirmation;
        if (!isAdmin && !consentementChecked) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }
        if (!isAdmin) { // En mode non admin, on envoie systématiquement le mail de confirmation
            sendMailConfirmation = true;
        }

        if (id) {
            setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }), data: inscriptionToSave, params: { sendMailConfirmation } });
        } else {
            setApiCallDefinition({ method: "POST", url: NEW_INSCRIPTION_ADULTE_ENDPOINT, data: inscriptionToSave, params: { sendMailConfirmation } });
        }
    };

    const onStatutProfessionnelChanged = (value: any) => {
        if (value) {
            setApiCallDefinition({ method: "GET", url: NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT, params: { statutProfessionnel: value } });
        } else {
            setTarifInscription(undefined);
        }
    }

    const tarifInscriptionApiCallBack = (result: any) => {
        if (result) {
            setTarifInscription(result);
        } else if (status === HttpStatusCode.NoContent) { // No content (pas de tarif pour la période)
            notification.open({ message: "Aucun tarif n'a été trouvé pour la période en cours", type: "error" });
            setTarifInscription(undefined);
        }
        resetApi();
    }

    const apiCallbacks: ApiCallbacks = {
        [`PUT:${INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            if (result) {
                notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
                navigate("/adminCours", { state: { application: "COURS_ADULTE" } });
                resetApi();
            }
        },
        [`POST:${NEW_INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            if (result) {
                setInscriptionSuccess(true);
                form.resetFields();
                resetApi();
            }
        },
        [`GET:${INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            const inscriptionFormValues: InscriptionAdulteFront = prepareInscriptionAdulteBeforeForm(result as InscriptionAdulteBack);
            form.setFieldsValue(inscriptionFormValues);
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT, { id }), params: { statutProfessionnel: inscriptionFormValues.statutProfessionnel } });
        },
        [`GET:${NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT}`]: tarifInscriptionApiCallBack,
        [`GET:${INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT}`]: tarifInscriptionApiCallBack,
        [`GET:${PARAM_ENDPOINT}`]: (result: any) => {
            const resultAsParamsDto = result as ParamsDtoB;
            setIsInscriptionsFermees(isInscriptionFerme(resultAsParamsDto.inscriptionAdulteEnabledFromDate));
        },
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
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }) });
        } else {
            setApiCallDefinition({ method: "GET", url: PARAM_ENDPOINT })
        }
    }, []);

    const NiveauHelpContent = (
        <div>
            <p><b>Débutant :</b> Aucune ou très peu de connaissances.</p>
            <p><b>Intermédiaire :</b> Connaissances de bases, notamment l'alphabet</p>
            <p><b>Avancé :</b> Connaissances approfondies, sait lire et parler</p>
        </div>
    );

    const getInscriptionFermeesContent = () => {
        return (
            <>
                <div className="centered-content-v">
                    <div className="inscription-closed" />
                    <div>Les inscriptions sont actuellement fermées</div>
                </div>
            </>
        );
    }

    const getFormContent = () => {
        return inscriptionSuccess ? (
            <div className="centered-content">
                <Result
                    status="success"
                    title="Inscription enregistrée"
                    subTitle={(<div className="result-message">Votre inscription a bien été enregistrée. Vous serez recontacté rapidement.</div>)}
                    extra={[
                        <Button type="primary" onClick={() => setInscriptionSuccess(false)}>
                            Nouvelle inscription
                        </Button>]}
                />
            </div>) :
            (<div className="centered-content">
                <Form
                    name="adhesion"
                    onFinish={onFinish}
                    autoComplete="off"
                    form={form}
                    className="container-form"
                >
                    <h2 className="insc-adulte-title">
                        <UserOutlined /> Inscription aux cours arabes pour adultes
                    </h2>
                    <Spin spinning={isLoading} size="large" tip="Enregistrement de votre adhésion...">
                        <Row>
                            <Col span={24}>
                                <Divider orientation="left">Identité</Divider>
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
                            <Col xs={24} md={12}>
                                <DatePickerFormItem label="Date de naissance" name="dateNaissance" rules={[{ required: true, message: "Veuillez saisir votre date de naissance" },
                                { validator: validateMajorite }
                                ]}
                                    placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                            </Col>
                            <Col xs={24} md={12}>
                                <RadioGroupFormItem label="Sexe" name="sexe" disabled={isReadOnly} radioOptions={[{ value: Sexe.MASCULIN, label: "Masculin" },
                                { value: Sexe.FEMININ, label: "Féminin" }]} rules={[{ required: true, message: "Veuillez saisir votre sexe" }]} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={15} md={10}>
                                <SelectFormItem label="Niveau" name="niveauInterne" disabled={isReadOnly} options={getNiveauInterneAdulteOptions()}
                                    rules={[{ required: true, message: "Veuillez saisir votre niveau" }]} />
                            </Col>
                            <Col span={3}>
                                <Popover content={NiveauHelpContent} title="Comment choisir votre niveau ?" trigger="click">
                                    <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                </Popover>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={15} md={12} lg={10}>
                                <SelectFormItem label="Statut professionnel" name="statutProfessionnel" disabled={isReadOnly} options={getStatutsProfessionnelsOptions()}
                                    rules={[{ required: true, message: "Veuillez saisir votre statut professionel" }]} onChange={onStatutProfessionnelChanged} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Divider orientation="left">Contacts</Divider>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={16} lg={12}>
                                <InputFormItem label="Numéro et rue" name="numeroEtRue" rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                                    disabled={isReadOnly} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={10} md={8}>
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
                        {
                            tarifInscription && tarifInscription.tarif > 0 && (
                                <>
                                    <Divider orientation="left">Tarif</Divider>
                                    <div className="m-bottom-10">Votre tarif annuel : <strong>{tarifInscription.tarif} euros.</strong></div>
                                </>
                            )
                        }
                        {isAdmin && (<><Divider orientation="left">Administration</Divider>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    <RadioGroupFormItem label="Statut adhésion" name="statut" disabled={isReadOnly} radioOptions={[{ value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                    { value: StatutInscription.VALIDEE, label: "Validée" }]} />
                                </Col>
                            </Row>
                            <Divider orientation="left">Renvoi du mail de confirmation</Divider>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    <SwitchFormItem name="sendMailConfirmation" label="Renvoi automatique du mail de confirmation" disabled={isReadOnly} />
                                </Col>
                            </Row>
                        </>
                        )}
                        <Row gutter={[16, 32]}>
                            <Col span={24}>
                                {!isAdmin && (
                                    <div className="m-top-30">
                                        <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                                            {getConsentementInscriptionCoursLibelle()}
                                        </Checkbox>
                                    </div>
                                )}
                            </Col>
                        </Row>
                        <div style={{ textAlign: "center", marginTop: 30 }}>
                            {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                            {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon inscription</Button>)}
                        </div>
                    </Spin>
                </Form >
            </div>
            );
    }

    return isInscriptionsFermees ? getInscriptionFermeesContent() : getFormContent();
}