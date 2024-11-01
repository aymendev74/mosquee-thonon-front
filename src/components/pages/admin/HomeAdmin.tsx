import { FunctionComponent, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/AuthContext";

export const HomeAdmin: FunctionComponent = () => {
    const { isAuthenticated, getLoggedUser } = useAuth();
    const [loggedUser, setLoggedUser] = useState<string>();

    useEffect(() => {
        setLoggedUser(getLoggedUser());
    }, [isAuthenticated]);

    return getLoggedUser() ? (
        <div className="centered-content">
            <div>
                <h1>Bienvenue <strong>{loggedUser}</strong> dans la partie Administration</h1>
                <br />
                <br />
                <p className="home">
                    Cette partie est réservée aux administrateurs de l'application.
                </p>
            </div>
        </div>
    ) : (<div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>);

}