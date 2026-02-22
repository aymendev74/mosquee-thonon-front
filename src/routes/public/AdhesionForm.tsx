import { Alert, Button, Card, Checkbox, Col, Form, Result, Row, Spin, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { FunctionComponent } from "react";
import { getConsentementAdhesionLibelle, validateCodePostal, validateMajorite, validateMontantMinAdhesion, validatePhoneNumber } from "../../utils/FormUtils";
import { StatutInscription } from "../../services/inscription";
import { InputNumberFormItem } from "../../components/common/InputNumberFormItem";
import { SelectFormItem } from "../../components/common/SelectFormItem";
import { InputFormItem } from "../../components/common/InputFormItem";
import { DatePickerFormItem } from "../../components/common/DatePickerFormItem";
import { RadioGroupFormItem } from "../../components/common/RadioGroupFormItem";
import { EuroCircleOutlined, LockOutlined, PhoneOutlined, SettingOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";
import { SwitchFormItem } from "../../components/common/SwitchFormItem";
import { useAdhesionManagement } from "./hooks/useAdhesionManagement";

const { Title } = Typography;

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
        lockStatus,
        isLocked,
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
                        {lockStatus.status === 'conflict' && (
                            <Alert
                                message="Ressource verrouillée"
                                description={`Cette adhésion est actuellement en cours de modification par ${lockStatus.username} jusqu'à ${new Date(lockStatus.expiresAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`}
                                type="warning"
                                icon={<LockOutlined />}
                                showIcon
                                closable
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Title level={5} style={{ marginBottom: 12 }}>
                            <UserOutlined /> Identité
                        </Title>
                        <Card size="small" style={{ marginBottom: 20 }}>
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
                                <Col xs={24} md={12}>
                                    <DatePickerFormItem label="Date de naissance" name="dateNaissance" rules={[{ required: true, message: "Veuillez saisir votre date de naissance" },
                                    { validator: validateMajorite }
                                    ]}
                                        placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                                </Col>
                            </Row>
                        </Card>

                        <Title level={5} style={{ marginBottom: 12 }}>
                            <PhoneOutlined /> Contacts
                        </Title>
                        <Card size="small" style={{ marginBottom: 20 }}>
                            <Row gutter={[16, 0]}>
                                <Col xs={24} md={16} lg={12}>
                                    <InputFormItem label="Numéro et rue" name="numeroEtRue" rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]}
                                        disabled={isReadOnly} />
                                </Col>
                            </Row>
                            <Row gutter={[16, 0]}>
                                <Col xs={14} md={8}>
                                    <InputFormItem label="Code postal" name={"codePostal"} rules={[{ validator: validateCodePostal }]} disabled={isReadOnly} required />
                                </Col>
                                <Col xs={14} md={10}>
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
                                {!isReadOnly && (
                                    <Col xs={24} md={12}>
                                        <InputFormItem label="Confirmation e-mail" name="confirmationEmail" rules={[{
                                            required: true,
                                            message: "Veuillez confirmer votre adresse e-mail",
                                        }, {
                                            validator: (_, value) => {
                                                const email = form.getFieldValue("email");
                                                if (!value || email === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject("Les adresses e-mail ne correspondent pas");
                                            },
                                        }]} required onPaste={(e) => e.preventDefault()} />
                                    </Col>
                                )}
                            </Row>
                        </Card>

                        <Title level={5} style={{ marginBottom: 12 }}>
                            <WalletOutlined /> Versement mensuel
                        </Title>
                        <Card size="small" style={{ marginBottom: 20 }}>
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
                        </Card>

                        {isAdmin && (
                            <>
                                <Title level={5} style={{ marginBottom: 12 }}>
                                    <SettingOutlined /> Administration
                                </Title>
                                <Card size="small" style={{ marginBottom: 20 }}>
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <RadioGroupFormItem label="Statut adhésion" name="statut" disabled={isReadOnly} radioOptions={[{ value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                            { value: StatutInscription.VALIDEE, label: "Validée" }]} />
                                        </Col>
                                    </Row>
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <InputFormItem label="Numéro de membre" name="noMembre" disabled={isReadOnly} />
                                        </Col>
                                    </Row>
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <SwitchFormItem name="sendMailConfirmation" label="Envoi du mail de confirmation (avec les coordonnées bancaires)"
                                                disabled={isReadOnly || statutAdhesion !== StatutInscription.VALIDEE} />
                                        </Col>
                                    </Row>
                                </Card>
                            </>
                        )}

                        {!isAdmin && (
                            <Card size="small" style={{ marginBottom: 20 }}>
                                <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                                    <span style={{ fontSize: 12 }}>
                                        {getConsentementAdhesionLibelle()}
                                    </span>
                                </Checkbox>
                            </Card>
                        )}

                        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                            {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                            {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon adhésion</Button>)}
                        </div>
                    </Spin>
                </Form>
            </div>
        );
}