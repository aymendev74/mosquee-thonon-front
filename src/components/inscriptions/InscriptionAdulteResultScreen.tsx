import { FunctionComponent } from "react";
import { Button, Card, Typography } from "antd";
import {
    CheckCircleFilled,
    MailOutlined,
    UserAddOutlined,
    LoginOutlined,
    FormOutlined,
} from "@ant-design/icons";
import { InscriptionAdulteResultDto } from "../../services/inscription";

const { Title, Text, Paragraph } = Typography;

interface InscriptionAdulteResultScreenProps {
    result: InscriptionAdulteResultDto;
    onNouvelleInscription: () => void;
}

export const InscriptionAdulteResultScreen: FunctionComponent<InscriptionAdulteResultScreenProps> = ({
    result,
    onNouvelleInscription,
}) => {

    const renderCompteSection = () => {
        if (result.newlyCreatedAccount) {
            return (
                <Card
                    className="result-screen-card"
                    style={{
                        background: "linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)",
                        border: "1px solid #91d5ff",
                    }}
                >
                    <div className="result-screen-card-content">
                        <div className="result-screen-card-icon" style={{ backgroundColor: "#e6f7ff" }}>
                            <UserAddOutlined style={{ fontSize: 28, color: "#1890ff" }} />
                        </div>
                        <div className="result-screen-card-text">
                            <Text strong style={{ fontSize: 15, color: "#003a8c" }}>
                                Un compte a été créé pour vous !
                            </Text>
                            <Paragraph style={{ margin: "8px 0 0 0", color: "#595959" }}>
                                Afin de pouvoir suivre l'évolution de votre inscription en ligne, un compte utilisateur a été créé avec votre adresse e-mail.
                            </Paragraph>
                            <div className="result-screen-highlight">
                                <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                <Text style={{ color: "#003a8c" }}>
                                    Vous allez recevoir un <Text strong>e-mail d'activation</Text> dans quelques instants. Pensez à vérifier vos spams.
                                </Text>
                            </div>
                        </div>
                    </div>
                </Card>
            );
        }

        if (!result.enabledAccount) {
            return (
                <Card
                    className="result-screen-card"
                    style={{
                        background: "linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)",
                        border: "1px solid #ffd591",
                    }}
                >
                    <div className="result-screen-card-content">
                        <div className="result-screen-card-icon" style={{ backgroundColor: "#fff7e6" }}>
                            <LoginOutlined style={{ fontSize: 28, color: "#fa8c16" }} />
                        </div>
                        <div className="result-screen-card-text">
                            <Text strong style={{ fontSize: 15, color: "#874d00" }}>
                                Vous avez déjà un compte !
                            </Text>
                            <Paragraph style={{ margin: "8px 0 0 0", color: "#595959" }}>
                                Nous avons trouvé un compte associé à votre adresse e-mail, mais celui-ci n'est pas encore activé.
                            </Paragraph>
                            <div className="result-screen-highlight" style={{ backgroundColor: "#fff7e6", borderColor: "#ffd591" }}>
                                <MailOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                                <Text style={{ color: "#874d00" }}>
                                    Pensez à <Text strong>activer votre compte</Text> en cliquant sur le lien reçu par e-mail afin de pouvoir suivre en ligne l'évolution de votre inscription.
                                    Si vous ne retrouvez pas votre e-mail d'activation, vous pouvez contacter un administrateur de l'association qui pourra vous renvoyer le lien.
                                </Text>
                            </div>
                        </div>
                    </div>
                </Card>
            );
        }

        return (
            <Card
                className="result-screen-card"
                style={{
                    background: "linear-gradient(135deg, #f6ffed 0%, #fcffe6 100%)",
                    border: "1px solid #b7eb8f",
                }}
            >
                <div className="result-screen-card-content">
                    <div className="result-screen-card-icon" style={{ backgroundColor: "#f6ffed" }}>
                        <LoginOutlined style={{ fontSize: 28, color: "#52c41a" }} />
                    </div>
                    <div className="result-screen-card-text">
                        <Text strong style={{ fontSize: 15, color: "#135200" }}>
                            Votre inscription a été rattachée à votre compte utilisateur
                        </Text>
                        <Paragraph style={{ margin: "8px 0 0 0", color: "#595959" }}>
                            Connectez-vous à votre espace personnel pour suivre l'évolution de votre inscription et faciliter vos futures démarches.
                        </Paragraph>
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            href="/login"
                            style={{ marginTop: 8, backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                        >
                            Me connecter
                        </Button>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="result-screen-container">
            <div
                className="result-screen-header"
                style={{
                    backgroundColor: "#f6ffed",
                    borderColor: "#b7eb8f",
                }}
            >
                <CheckCircleFilled style={{ fontSize: 64, color: "#52c41a" }} />
                <Title level={3} style={{ margin: "16px 0 0 0", color: "#52c41a" }}>
                    Inscription enregistrée !
                </Title>
                <Paragraph className="result-screen-message">
                    Votre inscription a bien été enregistrée. Vous serez recontacté rapidement.
                </Paragraph>
            </div>

            <div className="result-screen-mail-info">
                <MailOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                <Text style={{ color: "#595959" }}>
                    Un e-mail récapitulatif vous a été envoyé à l'adresse indiquée.
                </Text>
            </div>

            {renderCompteSection()}

            <div className="result-screen-actions">
                <Button
                    type="primary"
                    size="large"
                    icon={<FormOutlined />}
                    onClick={onNouvelleInscription}
                >
                    Nouvelle inscription
                </Button>
            </div>
        </div>
    );
};
