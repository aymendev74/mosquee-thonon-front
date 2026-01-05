import { FrownOutlined } from "@ant-design/icons";
import { Card } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { FunctionComponent } from "react";

export const NotFound: FunctionComponent = () => {
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
                    Contenu inexistant
                </Title>
                <Paragraph>
                    La page demandée n'existe pas
                </Paragraph>
            </Card>
        </div>
    )
}