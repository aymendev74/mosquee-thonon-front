import { Button, Checkbox, Col, Divider, Form, Result, Row, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent } from "react";
import { getConsentementAdhesionLibelle, validateCodePostal, validateMajorite, validateMontantMinAdhesion, validatePhoneNumber } from "../../utils/FormUtils";
import { StatutInscription } from "../../services/inscription";
import { InputNumberFormItem } from "../../components/common/InputNumberFormItem";
import { SelectFormItem } from "../../components/common/SelectFormItem";
import { InputFormItem } from "../../components/common/InputFormItem";
import { DatePickerFormItem } from "../../components/common/DatePickerFormItem";
import { RadioGroupFormItem } from "../../components/common/RadioGroupFormItem";
import { EuroCircleOutlined } from "@ant-design/icons";
import { SwitchFormItem } from "../../components/common/SwitchFormItem";
import { useAdhesionManagement } from "./hooks/useAdhesionManagement";

export const AdhesionForm: FunctionComponent = () => {
    const [form] = useForm();

    const {
        isLoading,
        versementMensuelOptions,
        autreMontantVisible,
        inscriptionSuccess,
        setInscriptionSuccess,
        consentementChecked,
        setConsentementChecked,
        statutAdhesion,
        isReadOnly,
        isAdmin,
        getCiviliteOptions,
        onMontantChanged,
        onFinish,
    } = useAdhesionManagement({ form });

    return inscriptionSuccess ? (
        <div className="centered-content">
            <Result
                status="success"
                title="Adhésion enregistrée"
                subTitle={(<div className="result-message">Votre adhésion a bien été enregistrée. Vous serez recontacté rapidement.</div>)}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionSuccess(false)}>
                        Nouvelle adhésion
                    </Button>]}
            />
        </div>) :
        (
            <div className="centered-content">
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
                                <InputFormItem label="E-mail" name="email" rules={[{
                                    required: true,
                                    type: "email",
                                    message:
                                        "Veuillez saisir une adresse e-mail valide",
                                }]} disabled={isReadOnly} required />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Divider orientation="left">Versement mensuel</Divider>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={18} lg={12}>
                                <SelectFormItem name="idTarif" label="Ma cotisation mensuelle" rules={[{
                                    required: true, message: "Veuillez saisir le montant de votre cotisation"
                                }]}
                                    disabled={isReadOnly} options={versementMensuelOptions} onChange={onMontantChanged} />
                            </Col>
                            {autreMontantVisible && (<Col xs={24} md={10} lg={8}>
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
                            <Divider orientation="left">Renvoi du mail de confirmation</Divider>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                    <SwitchFormItem name="sendMailConfirmation" label="Envoi du mail de confirmation (avec les coordonnées bancaires)"
                                        disabled={isReadOnly || statutAdhesion !== StatutInscription.VALIDEE} />
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
            </div>
        );
}