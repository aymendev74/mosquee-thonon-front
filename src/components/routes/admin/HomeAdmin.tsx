import { FunctionComponent, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/AuthContext";
import { Layout, Card, Typography, Space } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const HomeAdmin: FunctionComponent = () => {
    const { username } = useAuth();
    const [loggedUser, setLoggedUser] = useState<string | null>();

    useEffect(() => {
        setLoggedUser(username);
    }, [username]);

    return (
        <Layout>
            <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
                {username ? (
                    <Card
                        style={{
                            maxWidth: "600px",
                            width: "100%",
                            textAlign: "center",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <Space direction="vertical">
                            <SmileOutlined style={{ fontSize: "48px", color: "orange" }} />
                            <Title level={2}>
                                Bienvenue, <strong>{loggedUser}</strong>
                            </Title>
                            <Paragraph>
                                Cette partie est réservée aux administrateurs et enseignants de l'application.
                            </Paragraph>
                            <Paragraph>
                                Utilisez les menus pour gérer les inscriptions, les classes et bien plus encore.
                            </Paragraph>
                        </Space>
                    </Card>
                ) : <UnahtorizedAccess />}
            </Content>
        </Layout>
    );
};