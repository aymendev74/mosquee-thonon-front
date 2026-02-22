import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { BookOutlined, DollarCircleOutlined, EditOutlined, EuroCircleOutlined, HomeOutlined, MenuOutlined, SettingOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/AuthContext";

export const MyMenu: FunctionComponent = () => {
    const navigate = useNavigate();
    const { roles } = useAuth();
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
            key: "adhesionInfos",
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
            key: "classeMenu",
            icon: <UserOutlined />,
            label: "Classes",
            children: [
                {
                    key: "creerModifierClasse",
                    label: "Créer ou Modifier",
                    icon: <UserOutlined />,
                },
                {
                    key: "classes",
                    icon: <TeamOutlined />,
                    label: "Mes classes",
                }
            ]
        },
        {
            key: "utilisateurs",
            icon: <UserOutlined />,
            label: "Utilisateurs",
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

    function getTresorierMenuItems() {
        const menuItems: MenuProps["items"] = [{
            key: "adminAdhesion",
            icon: <EuroCircleOutlined />,
            label: "Adhésion",
        }];
        return menuItems;
    }

    function getUtilisateurMenuItems() {
        const menuItems: MenuProps["items"] = [{
            key: "dashboard",
            icon: <BookOutlined />,
            label: "Mes inscriptions",
        }];
        return menuItems;
    }

    const getMenuItems = () => {
        const isAuthenticated = roles && roles.length > 0;
        if (!isAuthenticated) {
            return getPublicMenuItems();
        }
        const items: MenuProps["items"] = [];
        const addedKeys = new Set<string>();
        const addItems = (newItems: MenuProps["items"]) => {
            newItems?.forEach((item) => {
                if (item && "key" in item && !addedKeys.has(item.key as string)) {
                    addedKeys.add(item.key as string);
                    items.push(item);
                }
            });
        };
        if (roles.includes("ROLE_ADMIN")) addItems(getAdminMenuItems());
        if (roles.includes("ROLE_ENSEIGNANT")) addItems(getEnseignantMenuItems());
        if (roles.includes("ROLE_TRESORIER")) addItems(getTresorierMenuItems());
        if (roles.includes("ROLE_UTILISATEUR")) addItems(getUtilisateurMenuItems());
        return items;
    }


    return (<Menu theme="dark" mode="horizontal" onClick={onMenuClicked} overflowedIndicator={<MenuOutlined />}
        items={getMenuItems()} />);
}