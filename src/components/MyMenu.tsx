import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { DollarCircleOutlined, EuroCircleOutlined, HomeOutlined, MenuOutlined, SettingOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/AuthContext";

export const MyMenu: FunctionComponent = () => {
    const navigate = useNavigate();
    const { getLoggedUser } = useAuth();
    const onMenuClicked: MenuProps['onClick'] = (menuInfo) => {
        if (menuInfo.key === "home") {
            navigate("/");
        } else if (menuInfo.key === "adminCoursAdultes" || menuInfo.key === "adminCoursEnfants") {
            const application = menuInfo.key === "adminCoursAdultes" ? "COURS_ADULTE" : "COURS_ENFANT";
            navigate("/adminCours", { state: { application } });
        } else {
            navigate("/" + menuInfo.key);
        }
    }

    const getPublicMenuItems = () => {
        const menuItems: MenuProps["items"] = [{
            key: "home",
            icon: <HomeOutlined />,
            label: "Accueil",
        },
        {
            key: "cours",
            icon: <UserOutlined />,
            label: "Cours arabes",
            children: [
                {
                    key: "coursAdultes",
                    label: "Adultes",
                    icon: <UserOutlined />,
                },
                {
                    key: "coursEnfants",
                    label: "Enfants",
                    icon: <TeamOutlined />,
                }
            ],
        },
        {
            key: "adhesion",
            icon: <EuroCircleOutlined />,
            label: "Adhésion",
        },
        /*{
            key: "don",
            icon: <EuroCircleOutlined />,
            label: "Faire un don",
        }*/];
        return menuItems;
    };

    const getAdminMenuItems = () => {
        const menuItems: MenuProps["items"] = [{
            key: "adminCours",
            icon: <UserOutlined />,
            label: "Cours arabes",
            children: [
                {
                    key: "adminCoursAdultes",
                    label: "Adultes",
                    icon: <UserOutlined />,
                },
                {
                    key: "adminCoursEnfants",
                    label: "Enfants",
                    icon: <TeamOutlined />,
                }
            ]
        },
        {
            key: "adminAdhesion",
            icon: <EuroCircleOutlined />,
            label: "Adhésion",
        },
        {
            key: "adminTarif",
            icon: <DollarCircleOutlined />,
            label: "Tarifs",
        },
        {
            key: "parametres",
            icon: <SettingOutlined />,
            label: "Paramètres",
        }];
        return menuItems;
    };

    const getMenuItems = () => {
        return getLoggedUser() ? getAdminMenuItems() : getPublicMenuItems();
    }


    return (<Menu theme="dark" mode="horizontal" onClick={onMenuClicked} overflowedIndicator={<MenuOutlined />}
        items={getMenuItems()} />);
}