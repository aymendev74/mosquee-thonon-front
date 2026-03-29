import { Button, Card, Col, Form, Row, Tag, Tooltip, Typography } from "antd";
import { FunctionComponent } from "react";
import { UserOutlined, PhoneOutlined, HomeOutlined, SafetyOutlined } from "@ant-design/icons";
import { validateCodePostal, validatePhoneNumber } from "../../utils/FormUtils";
import { InputFormItem } from "../common/InputFormItem";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";
import { FormInstance } from "antd/lib";

const { Title } = Typography;

export type ResponsableLegalProps = {
    isReadOnly: boolean;
    isAdmin: boolean;
    doCalculTarif: () => void;
    onNextStep: () => void;
    form: FormInstance;
}

export const ResponsableLegal: FunctionComponent<ResponsableLegalProps> = ({ isReadOnly, doCalculTarif, onNextStep, form }) => {

    const adherent = Form.useWatch(["responsableLegal", "adherent"], form);

    const handleNextStep = async () => {
        try {
            await form.validateFields();
            // Si valide on peut passer à l'étape suivante
            onNextStep();
        } catch (errorInfo) {
            console.log('Validation failed:', errorInfo);
        }
    };

    return (<>
        <InputFormItem name="responsableLegal.id" formStyle={{ display: "none" }} type="hidden" />
        <InputFormItem name="responsableLegal.signature" formStyle={{ display: "none" }} type="hidden" />
        <InputFormItem name="responsableLegal.idTarif" formStyle={{ display: "none" }} type="hidden" />

        <Title level={5} style={{ marginBottom: 12 }}>
            <UserOutlined /> Identité
        </Title>
        <Card size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <InputFormItem label="Nom"
                        name="responsableLegal.nom"
                        rules={[{ required: true, message: "Veuillez saisir votre nom" }]} disabled={isReadOnly} />
                </Col>
                <Col xs={24} md={12}>
                    <InputFormItem label="Prénom"
                        name="responsableLegal.prenom"
                        rules={[{ required: true, message: "Veuillez saisir votre prénom" }]} disabled={isReadOnly} />
                </Col>
            </Row>
        </Card>

        <Title level={5} style={{ marginBottom: 12 }}>
            <PhoneOutlined /> Contacts
        </Title>
        <Card size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 0]}>
                <Col md={16} lg={12}>
                    <InputFormItem label="Numéro et rue"
                        name="responsableLegal.numeroEtRue"
                        rules={[{ required: true, message: "Veuillez saisir votre numéro et rue" }]} disabled={isReadOnly} />
                </Col>
            </Row>
            <Row gutter={[16, 0]}>
                <Col xs={10} md={10} lg={6}>
                    <InputFormItem label="Code postal" name="responsableLegal.codePostal" required
                        rules={[{ validator: validateCodePostal }]} disabled={isReadOnly} />
                </Col>
                <Col xs={14} md={10}>
                    <InputFormItem label="Ville" name="responsableLegal.ville" rules={[{ required: true, message: "Veuillez saisir votre ville" }]} disabled={isReadOnly} />
                </Col>
            </Row>
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <InputFormItem label="Tél. mobile" name="responsableLegal.mobile" rules={[{ validator: validatePhoneNumber }]} required
                        disabled={isReadOnly} />
                </Col>
            </Row>
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <InputFormItem label="E-mail" name="responsableLegal.email" rules={[{
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
                                const email = form.getFieldValue(["responsableLegal", "email"]);
                                if (!value || email === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject("Les adresses e-mail ne correspondent pas");
                            },
                        }]} required onPaste={(e) => e.preventDefault()} />
                    </Col>
                )}
            </Row>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Tooltip color="geekblue" title="En étant adhérent, vous bénéficiez d'un tarif préférentiel pour les cours d'arabes">
                    <SwitchFormItem label="Je suis adhérent" name="responsableLegal.adherent" disabled={isReadOnly} onChange={() => doCalculTarif()} />
                </Tooltip>
                <Tag color={adherent ? "green" : "default"} style={{ marginBottom: 24 }}>
                    {adherent ? "Adhérent" : "Non adhérent"}
                </Tag>
            </div>
        </Card>

        <Title level={5} style={{ marginBottom: 12 }}>
            <HomeOutlined /> Autre contact (en cas d'urgence)
        </Title>
        <Card size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <InputFormItem label="Nom" name="responsableLegal.nomAutre" rules={[{ required: true, message: "Veuillez saisir le nom" }]} disabled={isReadOnly} />
                </Col>
                <Col xs={24} md={12}>
                    <InputFormItem label="Prénom" name="responsableLegal.prenomAutre" rules={[{ required: true, message: "Veuillez saisir le prénom" }]} disabled={isReadOnly} />
                </Col>
            </Row>
            <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                    <InputFormItem label="Lien de parenté" name="responsableLegal.lienParente" rules={[{ required: true, message: "Veuillez saisir le lien de parenté" }]}
                        disabled={isReadOnly} />
                </Col>
                <Col xs={24} md={12}>
                    <InputFormItem label="Tél. mobile" name="responsableLegal.telephoneAutre" rules={[{ validator: validatePhoneNumber }]}
                        disabled={isReadOnly} required />
                </Col>
            </Row>
        </Card>

        <Title level={5} style={{ marginBottom: 12 }}>
            <SafetyOutlined /> Autorisations
        </Title>
        <Card size="small" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 12]}>
                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 4, fontSize: 13 }}>J'autorise mes enfants à rentrer seuls après l'école :</div>
                    <RadioGroupFormItem name="responsableLegal.autorisationAutonomie" rules={[{ required: true, message: "Veuillez donner ou non votre autorisation" }]}
                        radioOptions={[{ value: "OUI", label: "Oui" }, { value: "NON", label: "Non" }]} disabled={isReadOnly} />
                </Col>
                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 4, fontSize: 13 }}>J'autorise mes enfants à être photographiés et/ou filmés lors des activités organisées par AMC :</div>
                    <RadioGroupFormItem name="responsableLegal.autorisationMedia" rules={[{ required: true, message: "Veuillez donner ou non votre autorisation" }]}
                        radioOptions={[{ value: "OUI", label: "Oui" }, { value: "NON", label: "Non" }]} disabled={isReadOnly} />
                </Col>
            </Row>
        </Card>

        <div className="container-nav-mono">
            <Button onClick={handleNextStep} type="primary">Suivant</Button>
        </div>
    </>);

}