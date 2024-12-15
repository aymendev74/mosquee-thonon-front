import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { DollarCircleOutlined, EditOutlined, EuroCircleOutlined, HomeOutlined, MenuOutlined, SettingOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/AuthContext";

export const MyMenu: FunctionComponent = () => {
    const navigate = useNavigate();
    const { getRoles } = useAuth();
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
        },
        {
            key: "enseignants",
            icon: <EditOutlined />,
            label: "Enseignants",
        },
        {
            key: "classeMenu",
            icon: <UserOutlined />,
            label: "Classes",
            children: [
                {
                    key: "creerModifierClasse",
                    label: "Créer ou Modifier",
                    icon: <UserOutlined />,
                }
            ]
        }];
        return menuItems;
    };

    function getEnseignantMenuItems() {
        const menuItems: MenuProps["items"] = [{
            key: "classes",
            icon: <TeamOutlined />,
            label: "Mes classes",
        }];
        return menuItems;
    }

    const getMenuItems = () => {
        if (getRoles()?.includes("ROLE_ADMIN")) {
            return getAdminMenuItems();
        } else if (getRoles()?.includes("ROLE_ENSEIGNANT")) {
            return getEnseignantMenuItems();
        } else {
            return getPublicMenuItems();
        }
    }


    return (<Menu theme="dark" mode="horizontal" onClick={onMenuClicked} overflowedIndicator={<MenuOutlined />}
        items={getMenuItems()} />);
}