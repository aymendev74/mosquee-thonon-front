import { FunctionComponent, useEffect } from "react";
import { useAuth } from "../../../hooks/AuthContext";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export const SignIn: FunctionComponent = () => {

    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/admin");
        }
    }, []);

    return (
        <Button type="primary" onClick={login}>Se connecter</Button>
    );

}