import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { CrownOutlined, DollarCircleOutlined, EuroCircleOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/UseAuth";

export const MyMenu: FunctionComponent = () => {
    const navigate = useNavigate();
    const { loggedUser } = useAuth();

    const onMenuClicked: MenuProps['onClick'] = (menuInfo) => {
        if (menuInfo.key === "home") {
            navigate("/");
        } else if (menuInfo.key === "cours") {
            navigate("/cours");
        } else if (menuInfo.key === "adhesion") {
            navigate("/adhesion");
        } else if (menuInfo.key === "adminCours") {
            navigate("/adminCours");
        } else if (menuInfo.key === "adminAdhesion") {
            navigate("/adminAdhesion");
        } else if (menuInfo.key === "adminTarif") {
            navigate("/adminTarif");
        }
    }

    const getMenuItems = () => {
        const menuItems: MenuProps["items"] = [{
            key: "home",
            icon: <HomeOutlined />,
            label: "Accueil",
        },
        {
            key: "inscription",
            icon: <UserOutlined />,
            label: "Inscription",
            children: [{ key: "cours", label: "Cours arabes", icon: <UserOutlined /> }, { key: "adhesion", label: "Adhésion", icon: <EuroCircleOutlined /> }]
        }];

        if (loggedUser) {
            menuItems.push({
                key: "administration",
                icon: <CrownOutlined />,
                label: "Administration",
                style: { background: "#06686E" },
                children: [{ key: "adminCours", label: "Cours arabes", icon: <UserOutlined /> },
                { key: "adminAdhesion", label: "Adhésion", icon: <EuroCircleOutlined /> },
                { key: "adminTarif", label: "Tarifs", icon: <DollarCircleOutlined /> },]
            });
        }
        return menuItems;
    }

    return (<Menu theme="dark" mode="horizontal" onClick={onMenuClicked}
        items={getMenuItems()} />);
}