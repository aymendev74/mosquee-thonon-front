import { FunctionComponent } from "react";
import { Button, Card, Collapse, Descriptions, Layout, Spin, Table, Tabs, Tag, Typography } from "antd";
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, HomeOutlined, PhoneOutlined, ReadOutlined, ReloadOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import useMesInscriptions from "./hooks/useMesInscriptions";
import useParametres from "./hooks/useParametres";
import { EleveDto, InscriptionAdulteParAnneeScolaireDto, InscriptionEnfantParAnneeScolaireDto, ResponsableLegalDto } from "../../services/mesInscriptions";
import { StatutInscription } from "../../services/inscription";
import { ROLE_UTILISATEUR } from "../../services/user";
import { getLibelleNiveauInterneAdulte, getLibelleStatutProfessionnel } from "../../components/common/commoninputs";
import { useMatieresStore } from "../../components/stores/useMatieresStore";
import { TypeMatiereEnum } from "../../services/classe";

const { Content } = Layout;
const { Title } = Typography;

const getStatutConfig = (statut: StatutInscription) => {
    switch (statut) {
        case StatutInscription.VALIDEE:
            return { color: "success", icon: <CheckCircleOutlined />, text: "Validée" };
        case StatutInscription.PROVISOIRE:
            return { color: "processing", icon: <ClockCircleOutlined />, text: "Provisoire" };
        case StatutInscription.LISTE_ATTENTE:
            return { color: "warning", icon: <ExclamationCircleOutlined />, text: "Liste d'attente" };
        case StatutInscription.REFUSE:
            return { color: "error", icon: <ExclamationCircleOutlined />, text: "Refusée" };
        default:
            return { color: "default", icon: <ClockCircleOutlined />, text: statut };
    }
};

const getColonnesEleves = (isMobile: boolean) => {
    if (isMobile) {
        // Mobile: fewer columns, more compact
        return [
            {
                title: "Élève",
                dataIndex: "nom",
                key: "eleve",
                render: (nom: string, record: EleveDto) => (
                    <div>
                        <div style={{ fontWeight: "bold" }}>{nom} {record.prenom}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{record.dateNaissance}</div>
                    </div>
                ),
            },
            {
                title: "Niveau",
                dataIndex: "niveau",
                key: "niveau",
                width: 80,
            },
        ];
    }

    // Desktop: full columns
    return [
        {
            title: "Nom",
            dataIndex: "nom",
            key: "nom",
        },
        {
            title: "Prénom",
            dataIndex: "prenom",
            key: "prenom",
        },
        {
            title: "Date de naissance",
            dataIndex: "dateNaissance",
            key: "dateNaissance",
        },
        {
            title: "Niveau scolaire",
            dataIndex: "niveau",
            key: "niveau",
        },
        {
            title: "Niveau interne",
            dataIndex: "niveauInterne",
            key: "niveauInterne",
            render: (value: string | null) => value ?? "-",
        },
    ];
};

const ResponsableLegalCard: FunctionComponent<{ responsableLegal: ResponsableLegalDto }> = ({ responsableLegal }) => {
    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                <Descriptions.Item label={<><UserOutlined /> Nom</>}>{responsableLegal.nom}</Descriptions.Item>
                <Descriptions.Item label="Prénom">{responsableLegal.prenom}</Descriptions.Item>
                <Descriptions.Item label="Email">{responsableLegal.email}</Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Mobile</>}>{responsableLegal.mobile}</Descriptions.Item>
                <Descriptions.Item label={<><HomeOutlined /> Adresse</>} span={2}>
                    {responsableLegal.numeroEtRue}, {responsableLegal.codePostal} {responsableLegal.ville}
                </Descriptions.Item>
                {responsableLegal.nomAutre && (
                    <>
                        <Descriptions.Item label="Contact d'urgence">
                            {responsableLegal.prenomAutre} {responsableLegal.nomAutre}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lien de parenté">{responsableLegal.lienParente}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone">{responsableLegal.telephoneAutre}</Descriptions.Item>
                    </>
                )}
                <Descriptions.Item label="Autorisation autonomie">
                    {responsableLegal.autorisationAutonomie ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Autorisation média">
                    {responsableLegal.autorisationMedia ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

const InscriptionEnfantAnnee: FunctionComponent<{ inscription: InscriptionEnfantParAnneeScolaireDto; shouldShowReinscriptionButton: boolean; onReinscription: (inscription: InscriptionEnfantParAnneeScolaireDto) => void }> = ({ inscription, shouldShowReinscriptionButton, onReinscription }) => {
    const statutConfig = getStatutConfig(inscription.statut);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return (
        <div>
            <Card size="small" style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
                <Descriptions column={{ xs: 1, sm: 3 }} size="small" bordered>
                    <Descriptions.Item label="Numéro d'inscription">
                        <strong>{inscription.noInscription}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut">
                        <Tag
                            color={statutConfig.color}
                            icon={statutConfig.icon}
                            style={{ fontSize: "14px", padding: "4px 8px" }}
                        >
                            {statutConfig.text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Montant total">
                        <strong>{inscription.montantTotal.toFixed(2)} €</strong>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Title level={5}>
                <UserOutlined /> Responsable légal
            </Title>
            <ResponsableLegalCard responsableLegal={inscription.responsableLegal} />

            <Title level={5}>
                <TeamOutlined /> Élèves inscrits ({inscription.eleves.length})
            </Title>
            <Table<EleveDto>
                dataSource={inscription.eleves}
                columns={getColonnesEleves(isMobile)}
                rowKey={(record) => `${record.nom}-${record.prenom}-${record.dateNaissance}`}
                pagination={false}
                size="small"
                scroll={isMobile ? undefined : { x: true }}
                style={{ width: "100%" }}
            />

            {/* Bouton de réinscription */}
            {shouldShowReinscriptionButton && (
                <Card
                    size="small"
                    style={{
                        marginTop: 16,
                        textAlign: "center",
                        backgroundColor: "#f0f8ff",
                        padding: isMobile ? "12px" : "16px"
                    }}
                >
                    <div style={{ marginBottom: isMobile ? 8 : 12 }}>
                        <p style={{
                            margin: 0,
                            color: "#1890ff",
                            fontWeight: "bold",
                            fontSize: isMobile ? "14px" : "inherit"
                        }}>
                            🎓 La réinscription pour l'année prochaine est ouverte !
                        </p>
                        <p style={{
                            margin: "4px 0 0 0",
                            fontSize: isMobile ? "11px" : "12px",
                            color: "#666",
                            lineHeight: "1.3"
                        }}>
                            En tant qu'élève déjà inscrit cette année, vous pouvez vous réinscrire prioritairement pour l'année scolaire {inscription.anneeDebut + 1} / {inscription.anneeFin + 1}
                        </p>
                    </div>
                    <Button
                        type="primary"
                        size={isMobile ? "middle" : "large"}
                        icon={<ReloadOutlined />}
                        onClick={() => onReinscription(inscription)}
                        style={{
                            backgroundColor: "#52c41a",
                            borderColor: "#52c41a",
                            width: isMobile ? "100%" : "auto",
                            maxWidth: isMobile ? "280px" : "none"
                        }}
                    >
                        {isMobile ? "Me réinscrire" : "Me réinscrire pour l'année prochaine"}
                    </Button>
                </Card>
            )}
        </div>
    );
};

const InscriptionAdulteAnnee: FunctionComponent<{ inscription: InscriptionAdulteParAnneeScolaireDto; shouldShowReinscriptionButton: boolean; onReinscription: (inscription: InscriptionAdulteParAnneeScolaireDto) => void }> = ({ inscription, shouldShowReinscriptionButton, onReinscription }) => {
    const statutConfig = getStatutConfig(inscription.statut);
    const { getMatieresByType } = useMatieresStore();
    const matieresAdultes = getMatieresByType(TypeMatiereEnum.ADULTE);

    const getLibelleMatiere = (code: string): string => {
        const found = matieresAdultes.find((m) => m.code === code);
        return found?.fr ?? code;
    };

    const isMobile = useMediaQuery({ maxWidth: 768 });

    return (
        <div>
            <Card size="small" style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
                <Descriptions column={{ xs: 1, sm: 3 }} size="small" bordered>
                    <Descriptions.Item label="Numéro d'inscription">
                        <strong>{inscription.noInscription}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut">
                        <Tag
                            color={statutConfig.color}
                            icon={statutConfig.icon}
                            style={{ fontSize: "14px", padding: "4px 8px" }}
                        >
                            {statutConfig.text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Montant total">
                        <strong>{inscription.montantTotal.toFixed(2)} €</strong>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                    <Descriptions.Item label={<><UserOutlined /> Nom</>}>{inscription.nom}</Descriptions.Item>
                    <Descriptions.Item label="Prénom">{inscription.prenom}</Descriptions.Item>
                    <Descriptions.Item label="Email">{inscription.email}</Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> Mobile</>}>{inscription.mobile}</Descriptions.Item>
                    <Descriptions.Item label="Date de naissance">{inscription.dateNaissance}</Descriptions.Item>
                    <Descriptions.Item label="Sexe">{inscription.sexe === "M" ? "Homme" : "Femme"}</Descriptions.Item>
                    <Descriptions.Item label="Niveau">{getLibelleNiveauInterneAdulte(inscription.niveauInterne)}</Descriptions.Item>
                    <Descriptions.Item label="Statut professionnel">{getLibelleStatutProfessionnel(inscription.statutProfessionnel)}</Descriptions.Item>
                </Descriptions>
                <div style={{ marginTop: 12, padding: "8px 12px", background: "#fafafa", borderRadius: 4 }}>
                    <span style={{ fontWeight: 500, marginRight: 8 }}>Enseignements :</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {inscription.matieres.map((m) => (
                            <Tag key={m} color="blue">{getLibelleMatiere(m)}</Tag>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Bouton de réinscription adulte */}
            {shouldShowReinscriptionButton && (
                <Card
                    size="small"
                    style={{
                        marginTop: 16,
                        textAlign: "center",
                        backgroundColor: "#f0f8ff",
                        padding: isMobile ? "12px" : "16px"
                    }}
                >
                    <div style={{ marginBottom: isMobile ? 8 : 12 }}>
                        <p style={{
                            margin: 0,
                            color: "#1890ff",
                            fontWeight: "bold",
                            fontSize: isMobile ? "14px" : "inherit"
                        }}>
                            🎓 La réinscription pour l'année prochaine est ouverte !
                        </p>
                        <p style={{
                            margin: "4px 0 0 0",
                            fontSize: isMobile ? "11px" : "12px",
                            color: "#666",
                            lineHeight: "1.3"
                        }}>
                            En tant qu'inscrit(e) cette année, vous pouvez vous réinscrire prioritairement pour l'année scolaire {inscription.anneeDebut + 1} / {inscription.anneeFin + 1}
                        </p>
                    </div>
                    <Button
                        type="primary"
                        size={isMobile ? "middle" : "large"}
                        icon={<ReloadOutlined />}
                        onClick={() => onReinscription(inscription)}
                        style={{
                            backgroundColor: "#52c41a",
                            borderColor: "#52c41a",
                            width: isMobile ? "100%" : "auto",
                            maxWidth: isMobile ? "280px" : "none"
                        }}
                    >
                        {isMobile ? "Me réinscrire" : "Me réinscrire pour l'année prochaine"}
                    </Button>
                </Card>
            )}
        </div>
    );
};

const getCollapseLabel = (inscription: { anneeDebut: number; anneeFin: number; noInscription: string; statut: StatutInscription }, isMobile: boolean) => {
    const statutConfig = getStatutConfig(inscription.statut);
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: isMobile ? "wrap" : "nowrap"
        }}>
            <span style={{ fontSize: isMobile ? "14px" : "inherit" }}>
                <BookOutlined style={{ marginRight: 8 }} />
                Année scolaire {inscription.anneeDebut} / {inscription.anneeFin}
            </span>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "8px" : "12px",
                flexWrap: isMobile ? "wrap" : "nowrap"
            }}>
                <span style={{ fontSize: isMobile ? "10px" : "12px", color: "#666" }}>
                    N°{inscription.noInscription}
                </span>
                <Tag
                    color={statutConfig.color}
                    icon={statutConfig.icon}
                    style={{ fontSize: isMobile ? "10px" : "12px", margin: 0 }}
                >
                    {statutConfig.text}
                </Tag>
            </div>
        </div>
    );
};

const DashboardUtilisateur: FunctionComponent = () => {
    const { username, roles } = useAuth();
    const { inscriptionsEnfants, inscriptionsAdultes, isLoading } = useMesInscriptions();
    const { reinscriptionPrioritaire, isInscriptionsEnfantFermees, isInscriptionsAdulteFermees } = useParametres();
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    if (!username || !roles?.includes(ROLE_UTILISATEUR)) {
        return <UnahtorizedAccess />;
    }

    const shouldShowReinscriptionButton = (inscription: InscriptionEnfantParAnneeScolaireDto) => {
        const currentYear = new Date().getFullYear();
        const isCurrentYear = inscription.anneeFin === currentYear;
        const hasNewerInscription = inscriptionsEnfants.some((i) => i.anneeFin > inscription.anneeFin);
        return isCurrentYear && reinscriptionPrioritaire && !isInscriptionsEnfantFermees && !hasNewerInscription;
    };

    const shouldShowReinscriptionAdulteButton = (inscription: InscriptionAdulteParAnneeScolaireDto) => {
        const currentYear = new Date().getFullYear();
        const isCurrentYear = inscription.anneeFin === currentYear;
        const hasNewerInscription = inscriptionsAdultes.some((i) => i.anneeFin > inscription.anneeFin);
        return isCurrentYear && !isInscriptionsAdulteFermees && !hasNewerInscription;
    };

    const handleReinscription = (inscription: InscriptionEnfantParAnneeScolaireDto) => {
        navigate("/reinscriptionEnfants", { state: { inscription } });
    };

    const handleReinscriptionAdulte = (inscription: InscriptionAdulteParAnneeScolaireDto) => {
        navigate("/reinscriptionAdultes", { state: { inscription } });
    };

    const hasEnfants = inscriptionsEnfants.length > 0;
    const hasAdultes = inscriptionsAdultes.length > 0;
    const hasNoInscription = !hasEnfants && !hasAdultes && !isLoading;

    const collapseEnfantItems = inscriptionsEnfants.map((inscription) => ({
        key: `enfant-${inscription.anneeDebut}-${inscription.anneeFin}`,
        label: getCollapseLabel(inscription, isMobile),
        children: <InscriptionEnfantAnnee
            inscription={inscription}
            shouldShowReinscriptionButton={shouldShowReinscriptionButton(inscription)}
            onReinscription={handleReinscription}
        />,
    }));

    const collapseAdulteItems = inscriptionsAdultes.map((inscription) => ({
        key: `adulte-${inscription.anneeDebut}-${inscription.anneeFin}`,
        label: getCollapseLabel(inscription, isMobile),
        children: <InscriptionAdulteAnnee
            inscription={inscription}
            shouldShowReinscriptionButton={shouldShowReinscriptionAdulteButton(inscription)}
            onReinscription={handleReinscriptionAdulte}
        />,
    }));

    return (
        <Layout>
            <Content style={{
                padding: isMobile ? "16px" : "24px",
                maxWidth: 1200,
                margin: "0 auto",
                width: "100%"
            }}>
                <h2 className="insc-enfant-title">
                    <BookOutlined /> Mes inscriptions
                </h2>

                <Spin spinning={isLoading} size="large" tip="Chargement...">
                    {hasNoInscription && (
                        <Card style={{ textAlign: "center" }}>
                            <p>Aucune inscription trouvée.</p>
                        </Card>
                    )}

                    {/* Les deux types d'inscriptions : affichage par onglets */}
                    {hasEnfants && hasAdultes && (
                        <Tabs
                            defaultActiveKey="enfants"
                            size={isMobile ? "small" : "large"}
                            items={[
                                {
                                    key: "enfants",
                                    label: (
                                        <span>
                                            <TeamOutlined /> Cours enfants
                                            <Tag style={{ marginLeft: 8 }}>{inscriptionsEnfants.length}</Tag>
                                        </span>
                                    ),
                                    children: (
                                        <Collapse
                                            defaultActiveKey={[`enfant-${inscriptionsEnfants[0].anneeDebut}-${inscriptionsEnfants[0].anneeFin}`]}
                                            items={collapseEnfantItems}
                                        />
                                    ),
                                },
                                {
                                    key: "adultes",
                                    label: (
                                        <span>
                                            <ReadOutlined /> Cours adultes
                                            <Tag style={{ marginLeft: 8 }}>{inscriptionsAdultes.length}</Tag>
                                        </span>
                                    ),
                                    children: (
                                        <Collapse
                                            defaultActiveKey={[`adulte-${inscriptionsAdultes[0].anneeDebut}-${inscriptionsAdultes[0].anneeFin}`]}
                                            items={collapseAdulteItems}
                                        />
                                    ),
                                },
                            ]}
                        />
                    )}

                    {/* Un seul type : affichage direct sans onglets */}
                    {hasEnfants && !hasAdultes && (
                        <Collapse
                            defaultActiveKey={[`enfant-${inscriptionsEnfants[0].anneeDebut}-${inscriptionsEnfants[0].anneeFin}`]}
                            items={collapseEnfantItems}
                        />
                    )}

                    {hasAdultes && !hasEnfants && (
                        <Collapse
                            defaultActiveKey={[`adulte-${inscriptionsAdultes[0].anneeDebut}-${inscriptionsAdultes[0].anneeFin}`]}
                            items={collapseAdulteItems}
                        />
                    )}
                </Spin>
            </Content>
        </Layout>
    );
};

export default DashboardUtilisateur;
