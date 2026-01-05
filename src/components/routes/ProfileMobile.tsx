import { FunctionComponent } from "react";
import { Card, Button, Avatar, Space, Divider } from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
import "../../styles/ProfileMobile.css";

export const ProfileMobile: FunctionComponent = () => {
    const navigate = useNavigate();
    const { username, logout } = useAuth();

    const handleChangePassword = () => {
        navigate("/changePassword");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="profile-mobile-container">
            <Card className="profile-mobile-card">
                <div className="profile-header">
                    <Avatar size={80} icon={<UserOutlined />} className="profile-avatar" />
                    <h2 className="profile-username">{username}</h2>
                </div>

                <Divider />

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button
                        type="default"
                        icon={<LockOutlined />}
                        size="large"
                        block
                        onClick={handleChangePassword}
                        className="profile-action-button"
                    >
                        Modifier mon mot de passe
                    </Button>

                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        size="large"
                        block
                        onClick={handleLogout}
                        className="profile-action-button"
                    >
                        Se déconnecter
                    </Button>
                </Space>
            </Card>
        </div>
    );
};
