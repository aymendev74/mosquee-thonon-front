import { FunctionComponent, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeOutlined, TeamOutlined, EuroCircleOutlined, UserOutlined, MenuOutlined, DollarCircleOutlined, SettingOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/AuthContext";
import { Drawer, Menu, MenuProps, Avatar } from "antd";
import "../styles/BottomNavigation.css";

export const BottomNavigation: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roles, logout, username } = useAuth();
    const [drawerVisible, setDrawerVisible] = useState(false);

    const getActiveKey = () => {
        const path = location.pathname;
        if (path === "/") return "home";
        if (path.includes("cours")) return "cours";
        if (path.includes("adhesion")) return "adhesion";
        if (path.includes("admin") || path.includes("classes") || path.includes("utilisateurs") || path.includes("parametres") || path.includes("changePassword")) return "admin";
        return "";
    };

    const handleNavClick = (key: string) => {
        if (key === "home") {
            navigate("/");
        } else if (key === "cours") {
            // Ouvrir le drawer pour choisir adultes/enfants
            setDrawerVisible(true);
        } else if (key === "adhesion") {
            if (roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_TRESORIER")) {
                navigate("/adminAdhesion");
            } else {
                navigate("/adhesionInfos");
            }
        } else if (key === "admin") {
            setDrawerVisible(true);
        }
    };

    const onDrawerMenuClick: MenuProps['onClick'] = (menuInfo) => {
        console.log(menuInfo.key);
        setDrawerVisible(false);
        if (menuInfo.key === "logout") {
            logout();
            navigate("/");
        } else if (menuInfo.key === "adminCoursAdultes" || menuInfo.key === "adminCoursEnfants") {
            const application = menuInfo.key === "adminCoursAdultes" ? "COURS_ADULTE" : "COURS_ENFANT";
            navigate("/adminCours", { state: { application } });
        } else {
            navigate("/" + menuInfo.key);
        }
    };

    const getDrawerMenuItems = () => {
        if (roles?.includes("ROLE_ADMIN")) {
            return [
                {
                    key: "adminCoursAdultes",
                    label: "Cours Adultes",
                    icon: <UserOutlined />,
                },
                {
                    key: "adminCoursEnfants",
                    label: "Cours Enfants",
                    icon: <TeamOutlined />,
                },
                {
                    key: "adminAdhesion",
                    icon: <EuroCircleOutlined />,
                    label: "Adhésion",
                },
                {
                    key: "adminTarif",
                    label: "Tarifs",
                    icon: <DollarCircleOutlined />,
                },
                {
                    key: "parametres",
                    label: "Paramètres",
                    icon: <SettingOutlined />,
                },
                {
                    key: "creerModifierClasse",
                    label: "Créer/Modifier Classe",
                    icon: <UserOutlined />,
                },
                {
                    key: "classes",
                    label: "Mes classes",
                    icon: <TeamOutlined />,
                },
                {
                    key: "utilisateurs",
                    label: "Utilisateurs",
                    icon: <UserOutlined />,
                },
                { type: "divider" as const },
                {
                    key: "changePassword",
                    label: "Modifier mot de passe",
                    icon: <LockOutlined />,
                },
                {
                    key: "logout",
                    label: "Se déconnecter",
                    icon: <LogoutOutlined />,
                    danger: true,
                }
            ];
        } else if (roles?.includes("ROLE_ENSEIGNANT")) {
            return [
                {
                    key: "classes",
                    label: "Mes classes",
                    icon: <TeamOutlined />,
                },
                { type: "divider" as const },
                {
                    key: "changePassword",
                    label: "Modifier mot de passe",
                    icon: <LockOutlined />,
                },
                {
                    key: "logout",
                    label: "Se déconnecter",
                    icon: <LogoutOutlined />,
                    danger: true,
                }
            ];
        } else if (roles?.includes("ROLE_TRESORIER")) {
            return [
                {
                    key: "adminAdhesion",
                    label: "Adhésion",
                    icon: <EuroCircleOutlined />,
                },
                { type: "divider" as const },
                {
                    key: "changePassword",
                    label: "Modifier mot de passe",
                    icon: <LockOutlined />,
                },
                {
                    key: "logout",
                    label: "Se déconnecter",
                    icon: <LogoutOutlined />,
                    danger: true,
                }
            ];
        } else {
            return [
                {
                    key: "coursAdultes",
                    label: "Cours Adultes",
                    icon: <UserOutlined />,
                },
                {
                    key: "coursEnfants",
                    label: "Cours Enfants",
                    icon: <TeamOutlined />,
                }
            ];
        }
    };

    const activeKey = getActiveKey();

    console.log(activeKey);
    return (
        <>
            <div className="bottom-navigation">
                <div 
                    className={`bottom-nav-item ${activeKey === "home" ? "active" : ""}`}
                    onClick={() => handleNavClick("home")}
                >
                    <HomeOutlined className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Accueil</span>
                </div>
                
                <div 
                    className={`bottom-nav-item ${activeKey === "cours" ? "active" : ""}`}
                    onClick={() => handleNavClick("cours")}
                >
                    <TeamOutlined className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Cours</span>
                </div>
                
                <div 
                    className={`bottom-nav-item ${activeKey === "adhesion" ? "active" : ""}`}
                    onClick={() => handleNavClick("adhesion")}
                >
                    <EuroCircleOutlined className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Adhésion</span>
                </div>
                
                <div 
                    className={`bottom-nav-item ${activeKey === "admin" ? "active" : ""}`}
                    onClick={() => handleNavClick("admin")}
                >
                    <MenuOutlined className="bottom-nav-icon" />
                    <span className="bottom-nav-label">Menu</span>
                </div>
                
            </div>

            <Drawer
                title={
                    <div className="drawer-header">
                        <Avatar 
                            size={48} 
                            icon={<UserOutlined />} 
                            style={{ backgroundColor: "#722ed1" }}
                        />
                        <span className="drawer-username">{username}</span>
                    </div>
                }
                placement="bottom"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                height="auto"
            >
                <Menu
                    mode="vertical"
                    onClick={onDrawerMenuClick}
                    items={getDrawerMenuItems()}
                />
            </Drawer>
        </>
    );
};
