import { Button, List, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
    DollarCircleOutlined,
    ToolOutlined,
    BulbOutlined,
    UsergroupAddOutlined,
    HeartOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const raisons = [
    {
        icon: <DollarCircleOutlined />,
        texte: "Contribuer au bon fonctionnement de votre mosquée, par votre présence et votre soutien financier",
    },
    {
        icon: <ToolOutlined />,
        texte: "Améliorer le confort et l’accueil des fidèles dans un lieu apaisant et bien entretenu",
    },
    {
        icon: <BulbOutlined />,
        texte: "Participer aux assemblées générales et partager vos idées pour faire évoluer votre mosquée",
    },
    {
        icon: <UsergroupAddOutlined />,
        texte: "Construire un avenir meilleur pour les générations futures",
    },
    {
        icon: <HeartOutlined />,
        texte: "Multiplier les bonnes actions pour espérer gagner la récompense ultime : le paradis",
    },
];

const AdhesionInfos = () => {
    const navigate = useNavigate();

    const handleAdherer = () => {
        navigate("/adhesions");
    };

    return (
        <div className="container-adhesion-infos">
            <div className="content-adhesion-infos">
                <Title level={2} className="title-adhesion-infos">
                    Pourquoi adhérer à l'AMC ?
                </Title>
                <Paragraph className="paragraph-adhesion-infos">
                    Association Musulmane du Chablais
                </Paragraph>

                <div className="separator-adhesion-infos" />

                <List
                    dataSource={raisons}
                    renderItem={(item) => (
                        <List.Item className="liste-raison">
                            <div className="icone">{item.icon}</div>
                            <span className="texte-raison">{item.texte}</span>
                        </List.Item>
                    )}
                />

                <div className="button-container">
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleAdherer}
                        className="button-adhesion"
                    >
                        Adhérer
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdhesionInfos;