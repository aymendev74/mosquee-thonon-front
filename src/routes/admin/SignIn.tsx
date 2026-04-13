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

        const getRedirectForRoles = (userRoles: string[]) => {
            if (userRoles.includes("ROLE_ADMIN") || userRoles.includes("ROLE_ENSEIGNANT") || userRoles.includes("ROLE_TRESORIER")) {
                return "/admin";
            }
            if (userRoles.includes(ROLE_UTILISATEUR)) {
                return "/dashboard";
            }
            return "/";
        };

        const init = async () => {
            if (code) {
                const result = await handleAuthorizationCode(code, state);
                if (result && result.from && result.from !== "/") {
                    navigate(result.from);
                } else {
                    navigate(getRedirectForRoles(result?.roles ?? []));
                }
            } else if (!username) {
                login(); // déclenche le redirect vers le serveur OAuth
            } else {
                navigate(getRedirectForRoles(roles));
            }
        };

        init();
    }, []);

    return <p>Connexion en cours...</p>;

}