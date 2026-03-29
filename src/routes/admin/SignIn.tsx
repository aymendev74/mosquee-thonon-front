import { FunctionComponent, useEffect } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROLE_UTILISATEUR } from "../../services/user";

export const SignIn: FunctionComponent = () => {

    const { login, handleAuthorizationCode, username, roles } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        const init = async () => {
            const getDefaultRedirect = () => {
                if (roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_ENSEIGNANT") || roles?.includes("ROLE_TRESORIER")) {
                    return "/admin";
                }
                if (roles?.includes(ROLE_UTILISATEUR)) {
                    return "/dashboard";
                }
                return "/";
            };

            if (code) {
                const redirectionUrl = await handleAuthorizationCode(code, state);
                navigate(redirectionUrl ?? getDefaultRedirect());
            } else if (!username) {
                login(); // déclenche le redirect vers le serveur OAuth
            } else {
                navigate(getDefaultRedirect());
            }
        };

        init();
    }, []);

    return <p>Connexion en cours...</p>;

}