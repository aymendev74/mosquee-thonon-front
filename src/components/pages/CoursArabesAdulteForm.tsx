import { Button, Checkbox, Col, Divider, Form, Result, Row, Spin, notification } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent, useEffect, useState } from "react";
import { Adhesion } from "../../services/adhesion";
import { useLocation, useNavigate } from "react-router-dom";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT, getConsentementAdhesionLibelle, getConsentementInscriptionCoursLibelle, validateCodePostal, validateEmail, validateMajorite, validateMontantMinAdhesion, validatePhoneNumber } from "../../utils/FormUtils";
import useApi from "../../hooks/useApi";
import { ADHESION_ENDPOINT, ApiCallbacks, buildUrlWithParams, handleApiCall, INSCRIPTION_ADULTE_ENDPOINT, NEW_INSCRIPTION_ADULTE_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import { InscriptionAdulte, StatutInscription } from "../../services/inscription";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";
import dayjs from "dayjs";
import { Sexe } from "../../services/eleve";
import { SelectFormItem } from "../common/SelectFormItem";
import { getNiveauInterneAdulteOptions } from "../common/commoninputs";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { rest } from "lodash";


export const CoursArabesAdulteForm: FunctionComponent = () => {

    const navigate = useNavigate();
    const [form] = useForm();
    const location = useLocation();
    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : false;
    const isAdmin = location.state ? location.state.isAdmin : false;
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [consentementChecked, setConsentementChecked] = useState(false);

    const onFinish = async (inscription: InscriptionAdulte) => {
        inscription.dateNaissance = dayjs(inscription.dateNaissance).format(APPLICATION_DATE_FORMAT);
        let { sendMailConfirmation, ...rest } = { ...inscription }
        if (!isAdmin && !consentementChecked) {
            notification.open({ message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider", type: "warning" });
            return;
        }
        if (!isAdmin) { // En mode non admin, on envoie systématiquement le mail de confirmation
            sendMailConfirmation = true;
        }

        if (id) {
            setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }), data: rest, params: { sendMailConfirmation, isAdmin: isAdmin } });
        } else {
            setApiCallDefinition({ method: "POST", url: NEW_INSCRIPTION_ADULTE_ENDPOINT, data: rest, params: { sendMailConfirmation, isAdmin: isAdmin } });
        }
    };

    const apiCallbacks: ApiCallbacks = {
        [`PUT:${INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les modifications ont bien été enregistrées", type: "success" });
            navigate("/adminCours", { state: { application: "COURS_ADULTE" } });
            resetApi()
        },
        [`POST:${NEW_INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            setInscriptionSuccess(true);
            form.resetFields();
            resetApi()
        },
        [`GET:${INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            const inscription = result as InscriptionAdulte;
            inscription.dateNaissance = dayjs(inscription.dateNaissance, APPLICATION_DATE_FORMAT);
            form.setFieldsValue(inscription);
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
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }) });
        }
    }, []);

    return inscriptionSuccess ? (
        <Result
            status="success"
            title="Inscription enregistrée"
            subTitle={(<div className="result-message">Votre inscription a bien été enregistrée. Vous serez recontacté rapidement.</div>)}
            extra={[
                <Button type="primary" onClick={() => setInscriptionSuccess(false)}>
                    Nouvelle inscription
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
                <Spin spinning={isLoading} size="large" tip="Enregistrement de votre adhésion...">
                    <Row>
                        <Col span={24}>
                            <Divider orientation="left">Identité</Divider>
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
                        <Col span={12}>
                            <DatePickerFormItem label="Date de naissance" name="dateNaissance" rules={[{ required: true, message: "Veuillez saisir votre date de naissance" },
                            { validator: validateMajorite }
                            ]}
                                placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <RadioGroupFormItem label="Sexe" name="sexe" disabled={isReadOnly} radioOptions={[{ value: Sexe.MASCULIN, label: "Masculin" },
                        { value: Sexe.FEMININ, label: "Féminin" }]} />
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={12}>
                            <SelectFormItem label="Niveau" name="niveauInterne" disabled={isReadOnly} options={getNiveauInterneAdulteOptions()} />
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
                            <InputFormItem label="Code postal" name={"codePostal"} rules={[{ validator: validateCodePostal }]} disabled={isReadOnly} required />
                        </Col>
                        <Col span={12}>
                            <InputFormItem label="Ville" name="ville" rules={[{ required: true, message: "Veuillez saisir votre ville" }]}
                                disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={12}>
                            <InputFormItem label="Tél. mobile" name="mobile" required
                                rules={[{ validator: validatePhoneNumber }]} disabled={isReadOnly} />
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={12}>
                            <InputFormItem label="E-mail" name="email" rules={[{ validator: validateEmail }]} disabled={isReadOnly} required />
                        </Col>
                    </Row>
                    {isAdmin && (<><Divider orientation="left">Administration</Divider>
                        <Row gutter={[16, 32]}>
                            <Col span={12}>
                                <RadioGroupFormItem label="Statut adhésion" name="statut" disabled={isReadOnly} radioOptions={[{ value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                { value: StatutInscription.VALIDEE, label: "Validée" }]} />
                            </Col>
                        </Row>
                        <Divider orientation="left">Renvoi du mail de confirmation</Divider>
                        <Row gutter={[16, 32]}>
                            <Col span={12}>
                                <SwitchFormItem name="sendMailConfirmation" label="Renvoi automatique du mail de confirmation" disabled={isReadOnly} />
                            </Col>
                        </Row>
                    </>
                    )}
                    <Row gutter={[16, 32]}>
                        <Col span={24}>
                            {!isAdmin && (
                                <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                                    {getConsentementInscriptionCoursLibelle()}
                                </Checkbox>
                            )}
                        </Col>
                    </Row>
                    <Row>
                        {isAdmin && !isReadOnly && (<Button style={{ marginTop: 30 }} type="primary" htmlType="submit">Enregistrer</Button>)}
                        {!isAdmin && (<Button style={{ marginTop: 30 }} type="primary" htmlType="submit">Valider mon inscription</Button>)}
                    </Row>
                </Spin>
            </Form >
        );
}