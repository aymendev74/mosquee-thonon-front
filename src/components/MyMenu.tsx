import { FunctionComponent } from "react";
import { Menu, MenuProps } from "antd";
import { useNavigate } from "react-router-dom"
import { HomeOutlined, UserOutlined } from "@ant-design/icons";

export type MyMenuProps = {
    isLoggedIn: boolean,
}

export const MyMenu: FunctionComponent<MyMenuProps> = ({ isLoggedIn }) => {
    const navigate = useNavigate();

    const onMenuClicked: MenuProps['onClick'] = (menuInfo) => {
        if (menuInfo.key === "home") {
            navigate("/");
        } else if (menuInfo.key === "inscription") {
            navigate("/inscription");
        } else if (menuInfo.key === "inscriptions") {
            navigate("/inscriptions");
        }
    }

    const getMenuItems = () => {
        const menuItems = [{
            key: "home",
            icon: <HomeOutlined />,
            label: "Accueil",
        },
        {
            key: "inscription",
            icon: <UserOutlined />,
            label: "Inscription",
        }];

        if (isLoggedIn) {
            menuItems.push({
                key: "inscriptions",
                icon: <UserOutlined />,
                label: "Inscriptions",
            });
        }
        return menuItems;
    }

    return (<Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']} onClick={onMenuClicked}
        items={getMenuItems()} />);
}