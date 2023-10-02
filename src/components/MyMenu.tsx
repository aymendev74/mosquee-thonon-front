import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { CrownOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/UseAuth";

export const MyMenu: FunctionComponent = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const onMenuClicked: MenuProps['onClick'] = (menuInfo) => {
        if (menuInfo.key === "home") {
            navigate("/");
        } else if (menuInfo.key === "inscription") {
            navigate("/inscription");
        } else if (menuInfo.key === "administration") {
            navigate("/administration");
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
        }];

        if (isAuthenticated) {
            menuItems.push({
                key: "administration",
                icon: <CrownOutlined />,
                label: "Administration",
                style: { background: '#06686E' }
            });
        }
        return menuItems;
    }

    return (<Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']} onClick={onMenuClicked}
        items={getMenuItems()} />);
}