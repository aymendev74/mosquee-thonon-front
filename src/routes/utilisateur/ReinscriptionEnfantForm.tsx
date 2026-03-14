import { FunctionComponent } from "react";
import { Alert, Button, Card, Checkbox, Col, Input, Radio, Result, Row, Select, Spin, Switch, Tag, Typography } from "antd";
import {
    ArrowLeftOutlined,
    BookOutlined,
    CheckCircleOutlined,
    EuroCircleOutlined,
    ReloadOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { useAuth } from "../../hooks/AuthContext";
import { ROLE_UTILISATEUR } from "../../services/user";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { useReinscriptionEnfant, ReinscriptionEleve } from "./hooks/useReinscriptionEnfant";
import { getConsentementInscriptionCoursLibelle } from "../../utils/FormUtils";
import { getLibelleNiveauScolaire, getNiveauOptions } from "../../components/common/commoninputs";
import { NiveauScolaire } from "../../services/inscription";

const { Title } = Typography;

const ReinscriptionEnfantForm: FunctionComponent = () => {
    const { username, roles } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const {
        isLoading,
        inscription,
        responsableLegal,
        eleves,
        selectedEleves,
        tarifInscription,
        consentementChecked,
        setConsentementChecked,
        reinscriptionFinished,
        adherent,
        anneeScolaireReinscription,
        toggleEleve,
        updateEleveNiveau,
        onAdherentChange,
        updateResponsableLegal,
        getMontantTotal,
        onSubmit,
        goBackToDashboard,
    } = useReinscriptionEnfant();

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

    const montantTotal = getMontantTotal();

    return (
        <div className="centered-content">
            <div className="container-form">
                <h2 className="insc-enfant-title">
                    <ReloadOutlined /> Réinscription aux cours arabes pour enfants
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

                    {/* Responsable légal */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <UserOutlined /> Responsable légal
                    </Title>
                    {responsableLegal && (
                        <Card size="small" style={{ marginBottom: 24 }}>
                            <Row gutter={[16, 12]}>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Nom</label>
                                    <Input value={responsableLegal.nom} onChange={(e) => updateResponsableLegal("nom", e.target.value)} disabled />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Prénom</label>
                                    <Input value={responsableLegal.prenom} onChange={(e) => updateResponsableLegal("prenom", e.target.value)} disabled />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Email</label>
                                    <Input value={responsableLegal.email} onChange={(e) => updateResponsableLegal("email", e.target.value)} disabled />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Tél. mobile</label>
                                    <Input value={responsableLegal.mobile} onChange={(e) => updateResponsableLegal("mobile", e.target.value)} />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Numéro et rue</label>
                                    <Input value={responsableLegal.numeroEtRue} onChange={(e) => updateResponsableLegal("numeroEtRue", e.target.value)} />
                                </Col>
                                <Col xs={12} md={6}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Code postal</label>
                                    <Input value={responsableLegal.codePostal} onChange={(e) => updateResponsableLegal("codePostal", e.target.value)} />
                                </Col>
                                <Col xs={12} md={6}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Ville</label>
                                    <Input value={responsableLegal.ville} onChange={(e) => updateResponsableLegal("ville", e.target.value)} />
                                </Col>
                            </Row>

                            <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Autre contact (en cas d'urgence)</div>
                            <Row gutter={[16, 12]}>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Nom</label>
                                    <Input value={responsableLegal.nomAutre ?? ""} onChange={(e) => updateResponsableLegal("nomAutre", e.target.value)} />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Prénom</label>
                                    <Input value={responsableLegal.prenomAutre ?? ""} onChange={(e) => updateResponsableLegal("prenomAutre", e.target.value)} />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Lien de parenté</label>
                                    <Input value={responsableLegal.lienParente ?? ""} onChange={(e) => updateResponsableLegal("lienParente", e.target.value)} />
                                </Col>
                                <Col xs={24} md={12}>
                                    <label style={{ fontWeight: 500, fontSize: 13 }}>Tél. mobile</label>
                                    <Input value={responsableLegal.telephoneAutre ?? ""} onChange={(e) => updateResponsableLegal("telephoneAutre", e.target.value)} />
                                </Col>
                            </Row>

                            <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Autorisations</div>
                            <Row gutter={[16, 12]}>
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: 4, fontSize: 13 }}>J'autorise mes enfants à rentrer seuls après l'école :</div>
                                    <Radio.Group
                                        value={responsableLegal.autorisationAutonomie === true ? "OUI" : responsableLegal.autorisationAutonomie === false ? "NON" : null}
                                        onChange={(e) => updateResponsableLegal("autorisationAutonomie", e.target.value === "OUI")}
                                    >
                                        <Radio value="OUI">Oui</Radio>
                                        <Radio value="NON">Non</Radio>
                                    </Radio.Group>
                                </Col>
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: 4, fontSize: 13 }}>J'autorise mes enfants à être photographiés/filmés :</div>
                                    <Radio.Group
                                        value={responsableLegal.autorisationMedia === true ? "OUI" : responsableLegal.autorisationMedia === false ? "NON" : null}
                                        onChange={(e) => updateResponsableLegal("autorisationMedia", e.target.value === "OUI")}
                                    >
                                        <Radio value="OUI">Oui</Radio>
                                        <Radio value="NON">Non</Radio>
                                    </Radio.Group>
                                </Col>
                            </Row>

                            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontWeight: 500 }}>Je suis adhérent :</span>
                                <Switch checked={adherent} onChange={onAdherentChange} />
                                <Tag color={adherent ? "green" : "default"}>
                                    {adherent ? "Adhérent" : "Non adhérent"}
                                </Tag>
                            </div>
                        </Card>
                    )}

                    {/* Sélection des élèves */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <TeamOutlined /> Élèves à réinscrire
                    </Title>
                    <div style={{ marginBottom: 8, color: "#666", fontSize: 13 }}>
                        Sélectionnez les élèves que vous souhaitez réinscrire. Par défaut, tous les élèves sont sélectionnés.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                        {eleves.map((eleve: ReinscriptionEleve, index: number) => (
                            <Card
                                key={`${eleve.nom}-${eleve.prenom}-${eleve.dateNaissance}`}
                                size="small"
                                style={{
                                    border: eleve.selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                    backgroundColor: eleve.selected ? "#f0f7ff" : "#fafafa",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                                onClick={() => toggleEleve(index)}
                            >
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    flexWrap: isMobile ? "wrap" : "nowrap",
                                }}>
                                    <Checkbox
                                        checked={eleve.selected}
                                        onChange={() => toggleEleve(index)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "bold", fontSize: 15 }}>
                                            {eleve.prenom} {eleve.nom}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                                            Né(e) le {eleve.dateNaissance}
                                            {eleve.niveauInterne && (
                                                <> {" · "} Niveau interne : {eleve.niveauInterne}</>
                                            )}
                                        </div>
                                        <div style={{ marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                                            <label style={{ fontSize: 12, fontWeight: 500, marginRight: 8 }}>Niveau scolaire :</label>
                                            <Select
                                                size="small"
                                                style={{ minWidth: 150 }}
                                                value={eleve.niveau}
                                                options={getNiveauOptions()}
                                                onChange={(value) => updateEleveNiveau(index, value)}
                                            />
                                        </div>
                                    </div>
                                    {eleve.selected && (
                                        <Tag color="blue" icon={<CheckCircleOutlined />}>
                                            Sélectionné
                                        </Tag>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Tarif */}
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <EuroCircleOutlined /> Tarif
                    </Title>
                    {selectedEleves.length === 0 ? (
                        <Alert
                            type="warning"
                            message="Veuillez sélectionner au moins un élève pour voir le tarif"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    ) : tarifInscription ? (
                        <Card
                            size="small"
                            style={{
                                marginBottom: 24,
                                backgroundColor: "#f6ffed",
                                border: "1px solid #b7eb8f",
                            }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                                    Tarif annuel pour {selectedEleves.length} élève{selectedEleves.length > 1 ? "s" : ""}
                                    {" "}({adherent ? "adhérent" : "non adhérent"})
                                </div>
                                <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: "bold", color: "#52c41a" }}>
                                    {montantTotal?.toFixed(2)} €
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Alert
                            type="error"
                            message="Aucun tarif n'a pu être calculé pour la période en cours"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    {/* Consentement */}
                    {tarifInscription && selectedEleves.length > 0 && (
                        <Card size="small" style={{ marginBottom: 24 }}>
                            <Checkbox
                                checked={consentementChecked}
                                onChange={(e) => setConsentementChecked(e.target.checked)}
                            >
                                <span style={{ fontSize: 12 }}>
                                    {getConsentementInscriptionCoursLibelle()}
                                </span>
                            </Checkbox>
                        </Card>
                    )}

                    {/* Actions */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                    }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={goBackToDashboard}
                            size={isMobile ? "middle" : "large"}
                        >
                            Retour
                        </Button>
                        <Button
                            type="primary"
                            size={isMobile ? "middle" : "large"}
                            icon={<CheckCircleOutlined />}
                            onClick={onSubmit}
                            disabled={!tarifInscription || selectedEleves.length === 0}
                            style={{
                                backgroundColor: "#52c41a",
                                borderColor: "#52c41a",
                            }}
                        >
                            {isMobile ? "Valider" : "Valider ma réinscription"}
                        </Button>
                    </div>
                </Spin>
            </div>
        </div>
    );
};

export default ReinscriptionEnfantForm;
