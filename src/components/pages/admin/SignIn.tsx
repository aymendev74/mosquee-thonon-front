import { FunctionComponent, useEffect } from "react";
import { useAuth } from "../../../hooks/AuthContext";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export const SignIn: FunctionComponent = () => {

    const { getLoggedUser, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (getLoggedUser()) {
            navigate("/admin");
        }
    }, []);

    return (
        <Button type="primary" onClick={login}>Se connecter</Button>
    );

}