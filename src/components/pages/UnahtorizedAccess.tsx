import { FrownOutlined } from "@ant-design/icons";
import { Card } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { FunctionComponent } from "react";

export const UnahtorizedAccess: FunctionComponent = () => {
    return (
        <div className="centered-content">
            <Card
                style={{
                    maxWidth: "400px",
                    textAlign: "center",
                    backgroundColor: "#ffffff",
                }}
            >
                <FrownOutlined style={{ fontSize: "48px", color: "orange" }} />
                <Title level={4} style={{ color: "#ff4d4f" }}>
                    Accès non autorisé
                </Title>
                <Paragraph>
                    Vous n'êtes pas connecté ou vous ne disposez pas des autorisations nécessaires pour accéder à cette page.
                </Paragraph>
            </Card>
        </div>
    )
}