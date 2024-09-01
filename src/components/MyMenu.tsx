import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { CrownOutlined, DollarCircleOutlined, EuroCircleOutlined, HomeOutlined, MenuOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/UseAuth";

export const MyMenu: FunctionComponent = () => {
    const navigate = useNavigate();
    const { loggedUser } = useAuth();

    const onMenuClicked: MenuProps['onClick'] = (menuInfo) => {
        if (menuInfo.key === "home") {
            navigate("/");
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
                },
                {
                    key: "coursEnfants",
                    label: "Enfants",
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
        return loggedUser ? getAdminMenuItems() : getPublicMenuItems();
    }


    return (<Menu theme="dark" mode="horizontal" onClick={onMenuClicked} overflowedIndicator={<MenuOutlined />}
        items={getMenuItems()} />);
}