import { FunctionComponent } from "react";
import { Alert, Button, Card, Checkbox, Col, Form, Popover, Result, Row, Spin, Typography } from "antd";
import {
    ArrowLeftOutlined,
    BookOutlined,
    CheckCircleOutlined,
    EuroCircleOutlined,
    PhoneOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { useAuth } from "../../hooks/AuthContext";
import { ROLE_UTILISATEUR } from "../../services/user";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { useReinscriptionAdulte } from "./hooks/useReinscriptionAdulte";
import { getConsentementInscriptionCoursLibelle } from "../../utils/FormUtils";
import { getNiveauInterneAdulteOptions, getStatutsProfessionnelsOptions } from "../../components/common/commoninputs";
import { InputFormItem } from "../../components/common/InputFormItem";
import { RadioGroupFormItem } from "../../components/common/RadioGroupFormItem";
import { SelectFormItem } from "../../components/common/SelectFormItem";
import { MultiTagSelect } from "../../components/common/MultiTagSelectFormItem";
import { Sexe } from "../../services/eleve";

const { Title } = Typography;

const NiveauHelpContent = (
    <div>
        <p><b>Débutant :</b> Aucune ou très peu de connaissances.</p>
        <p><b>Intermédiaire :</b> Connaissances de bases, notamment l'alphabet</p>
        <p><b>Avancé :</b> Connaissances approfondies, sait lire et parler</p>
    </div>
);

const ReinscriptionAdulteForm: FunctionComponent = () => {
    const { username, roles } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [form] = Form.useForm();

    const {
        isLoading,
        inscription,
        tarifInscription,
        consentementChecked,
        setConsentementChecked,
        reinscriptionFinished,
        anneeScolaireReinscription,
        matieresOptions,
        onFinish,
        goBackToDashboard,
    } = useReinscriptionAdulte({ form });

    if (!username || !roles?.includes(ROLE_UTILISATEUR)) {
        return <UnahtorizedAccess />;
    }

    if (!inscription) {
        return (
            <div className="centered-content">
                <Result
                    status="warning"
                    title="Aucune inscription trouvée"
                    subTitle="Veuillez accéder à cette page depuis votre tableau de bord."
                    extra={
                        <Button type="primary" onClick={goBackToDashboard} icon={<ArrowLeftOutlined />}>
                            Retour au tableau de bord
                        </Button>
                    }
                />
            </div>
        );
    }

    if (reinscriptionFinished) {
        return (
            <div className="centered-content">
                <div className="container-form">
                    <Result
                        status="success"
                        title="Réinscription enregistrée !"
                        subTitle={
                            <div className="result-message">
                                Votre réinscription a bien été enregistrée pour l'année scolaire {anneeScolaireReinscription}.
                                <br />
                                Un mail récapitulatif vous a été envoyé à l'adresse e-mail indiquée.
                            </div>
                        }
                        extra={
                            <Button type="primary" onClick={goBackToDashboard} icon={<ArrowLeftOutlined />}>
                                Retour au tableau de bord
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="centered-content">
            <Form
                name="reinscriptionAdulte"
                form={form}
                onFinish={onFinish}
                autoComplete="off"
                className="container-form"
            >
                <h2 className="insc-adulte-title">
                    <ReloadOutlined /> Réinscription aux cours arabes pour adultes
                </h2>

                <Spin spinning={isLoading} size="large" tip="Chargement...">
                    {/* Bandeau année scolaire */}
                    <Card
                        style={{
                            marginBottom: 24,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                        }}
                    >
                        <div style={{ textAlign: "center", color: "#fff" }}>
                            <BookOutlined style={{ fontSize: 22, marginBottom: 6 }} />
                            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: "bold" }}>
                                Réinscription pour l'année scolaire
                            </div>
                            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: "bold", marginTop: 4 }}>
                                {anneeScolaireReinscription}
                            </div>
                            <div style={{ fontSize: 13, marginTop: 8, opacity: 0.85 }}>
                                Basée sur votre inscription N°{inscription.noInscription} ({inscription.anneeDebut} / {inscription.anneeFin})
                            </div>
                        </div>
                    </Card>

                    {/* Identité */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <UserOutlined /> Identité
                    </Title>
                    <Card size="small" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Nom" name="nom" disabled />
                            </Col>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Prénom" name="prenom" disabled />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Date de naissance" name="dateNaissance" disabled />
                            </Col>
                            <Col xs={24} md={12}>
                                <RadioGroupFormItem
                                    label="Sexe"
                                    name="sexe"
                                    disabled
                                    radioOptions={[
                                        { value: Sexe.MASCULIN, label: "Masculin" },
                                        { value: Sexe.FEMININ, label: "Féminin" },
                                    ]}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={15} md={10}>
                                <SelectFormItem
                                    label="Niveau"
                                    name="niveauInterne"
                                    options={getNiveauInterneAdulteOptions()}
                                />
                            </Col>
                            <Col span={3}>
                                <Popover content={NiveauHelpContent} title="Comment choisir votre niveau ?" trigger="click">
                                    <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                </Popover>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={15} md={12} lg={10}>
                                <SelectFormItem
                                    label="Statut professionnel"
                                    name="statutProfessionnel"
                                    options={getStatutsProfessionnelsOptions()}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Contacts */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <PhoneOutlined /> Contacts
                    </Title>
                    <Card size="small" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={16} lg={12}>
                                <InputFormItem label="Numéro et rue" name="numeroEtRue" />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={10} md={8}>
                                <InputFormItem label="Code postal" name="codePostal" />
                            </Col>
                            <Col xs={14} md={10}>
                                <InputFormItem label="Ville" name="ville" />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="Tél. mobile" name="mobile" />
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} md={12}>
                                <InputFormItem label="E-mail" name="email" disabled />
                            </Col>
                        </Row>
                    </Card>

                    {/* Enseignements */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <BookOutlined /> Domaines d'apprentissage
                    </Title>
                    <Card size="small" style={{ marginBottom: 20 }}>
                        <Row>
                            <Col span={24}>
                                <MultiTagSelect
                                    name="matieres"
                                    label="Enseignement(s) souhaité(s)"
                                    options={matieresOptions}
                                    disabled={false}
                                    rules={[{
                                        required: true,
                                        validator: (_, val) =>
                                            val && val.length > 0
                                                ? Promise.resolve()
                                                : Promise.reject("Veuillez sélectionner au moins une matière"),
                                    }]}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Tarif */}
                    {tarifInscription && tarifInscription.tarif > 0 && (
                        <>
                            <Title level={5} style={{ marginBottom: 12 }}>
                                <EuroCircleOutlined /> Tarif
                            </Title>
                            <Card
                                size="small"
                                style={{
                                    marginBottom: 20,
                                    backgroundColor: "#f6ffed",
                                    border: "1px solid #b7eb8f",
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                                        Tarif annuel
                                    </div>
                                    <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: "bold", color: "#52c41a" }}>
                                        {tarifInscription.tarif.toFixed(2)} €
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Consentement */}
                    <Card size="small" style={{ marginBottom: 20 }}>
                        <Checkbox
                            checked={consentementChecked}
                            onChange={(e) => setConsentementChecked(e.target.checked)}
                        >
                            <span style={{ fontSize: 12 }}>
                                {getConsentementInscriptionCoursLibelle()}
                            </span>
                        </Checkbox>
                    </Card>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={goBackToDashboard}
                            size={isMobile ? "middle" : "large"}
                        >
                            Retour
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size={isMobile ? "middle" : "large"}
                            icon={<CheckCircleOutlined />}
                            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                        >
                            {isMobile ? "Valider" : "Valider ma réinscription"}
                        </Button>
                    </div>
                </Spin>
            </Form>
        </div>
    );
};

export default ReinscriptionAdulteForm;
