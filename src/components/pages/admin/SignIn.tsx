import { FunctionComponent, useEffect } from "react";
import { useAuth } from "../../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

export const SignIn: FunctionComponent = () => {

    const { login, handleAuthorizationCode, getLoggedUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        const init = async () => {
            if (code) {
                const redirectionUrl = await handleAuthorizationCode(code, state);
                navigate(redirectionUrl ?? "/admin");
            } else if (!getLoggedUser()) {
                login(); // déclenche le redirect vers le serveur OAuth
            } else {
                navigate("/admin");
            }
        };

        init();
    }, []);

    return <p>Connexion en cours...</p>;

}