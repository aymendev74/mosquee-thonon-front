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
        <div className="centered-content-bk">
            <div className="centered-content-bk m-top-30">Cliquez pour être dirigé vers la page d'authentification</div>
            <div className="centered-content-bk m-top-15">
                <Button type="primary" onClick={login} className="login-button">Se connecter</Button>
            </div>
        </div>
    );

}