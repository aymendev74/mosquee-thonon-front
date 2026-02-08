import { FunctionComponent } from "react";
import { Button, Card, Collapse, Descriptions, Layout, List, Spin, Table, Tag, Typography } from "antd";
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, HomeOutlined, PhoneOutlined, ReloadOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import useMesInscriptions from "./hooks/useMesInscriptions";
import useParametres from "./hooks/useParametres";
import { EleveAvecAutorisationsDto, InscriptionParAnneeScolaireDto, ResponsableLegalDto } from "../../services/mesInscriptions";
import { StatutInscription } from "../../services/inscription";
import { ROLE_UTILISATEUR } from "../../services/user";

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
                render: (nom: string, record: EleveAvecAutorisationsDto) => (
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
            {
                title: "Autorisations",
                key: "autorisations",
                width: 120,
                render: (record: EleveAvecAutorisationsDto) => (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <Tag
                            color={record.autorisationAutonomie ? "green" : "red"}
                            style={{ margin: 0, fontSize: "10px", padding: "1px 4px" }}
                        >
                            {record.autorisationAutonomie ? "Auto" : "Non auto"}
                        </Tag>
                        <Tag
                            color={record.autorisationMedia ? "green" : "red"}
                            style={{ margin: 0, fontSize: "10px", padding: "1px 4px" }}
                        >
                            {record.autorisationMedia ? "Média" : "Non média"}
                        </Tag>
                    </div>
                ),
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
        {
            title: "Autorisation autonomie",
            dataIndex: "autorisationAutonomie",
            key: "autorisationAutonomie",
            render: (value: boolean | null) => value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>,
        },
        {
            title: "Autorisation média",
            dataIndex: "autorisationMedia",
            key: "autorisationMedia",
            render: (value: boolean | null) => value ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>,
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
            </Descriptions>
        </Card>
    );
};

const InscriptionAnnee: FunctionComponent<{ inscription: InscriptionParAnneeScolaireDto; shouldShowReinscriptionButton: boolean; onReinscription: () => void }> = ({ inscription, shouldShowReinscriptionButton, onReinscription }) => {
    const statutConfig = getStatutConfig(inscription.statut);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return (
        <div>
            {/* En-tête avec les nouvelles informations */}
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

            <Title level={5} style={{ marginTop: 8 }}>
                <UserOutlined /> Responsable légal
            </Title>
            <ResponsableLegalCard responsableLegal={inscription.responsableLegal} />

            <Title level={5}>
                <TeamOutlined /> Élèves inscrits ({inscription.eleves.length})
            </Title>
            <Table<EleveAvecAutorisationsDto>
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
                        onClick={onReinscription}
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

const DashboardUtilisateur: FunctionComponent = () => {
    const { username, roles } = useAuth();
    const { inscriptions, isLoading } = useMesInscriptions();
    const { reinscriptionPrioritaire, isInscriptionsEnfantFermees } = useParametres();
    const navigate = useNavigate();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    if (!username || !roles?.includes(ROLE_UTILISATEUR)) {
        return <UnahtorizedAccess />;
    }

    // Vérifier si le bouton de réinscription doit être affiché
    const shouldShowReinscriptionButton = (inscription: InscriptionParAnneeScolaireDto) => {
        const currentYear = new Date().getFullYear();
        const isCurrentYear = inscription.anneeFin === currentYear;
        return isCurrentYear && reinscriptionPrioritaire && !isInscriptionsEnfantFermees;
    };

    const handleReinscription = () => {
        navigate("/coursEnfants");
    };

    const collapseItems = inscriptions.map((inscription) => {
        const statutConfig = getStatutConfig(inscription.statut);
        return {
            key: `${inscription.anneeDebut}-${inscription.anneeFin}`,
            label: (
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
            ),
            children: <InscriptionAnnee
                inscription={inscription}
                shouldShowReinscriptionButton={shouldShowReinscriptionButton(inscription)}
                onReinscription={handleReinscription}
            />,
        };
    });

    return (
        <Layout>
            <Content style={{
                padding: isMobile ? "16px" : "24px",
                maxWidth: 1200,
                margin: "0 auto",
                width: "100%"
            }}>
                <Title level={2} style={{ fontSize: isMobile ? "20px" : "inherit" }}>
                    <BookOutlined /> Mes inscriptions
                </Title>

                <Spin spinning={isLoading} size="large" tip="Chargement...">
                    {inscriptions.length === 0 && !isLoading ? (
                        <Card style={{ textAlign: "center" }}>
                            <p>Aucune inscription trouvée.</p>
                        </Card>
                    ) : (
                        <Collapse
                            defaultActiveKey={inscriptions.length > 0 ? [`${inscriptions[0].anneeDebut}-${inscriptions[0].anneeFin}`] : []}
                            items={collapseItems}
                        />
                    )}
                </Spin>
            </Content>
        </Layout>
    );
};

export default DashboardUtilisateur;
