import { FunctionComponent, useEffect, useState } from "react";
import { Inscription } from "../../services/inscription";
import { INSCRIPTION_ENDPOINT } from "../../services/services";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import useApi from "../../services/useApi";

export const Inscriptions: FunctionComponent = () => {

    const [inscriptions, setInscription] = useState<Inscription[]>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { result, setApiCallDefinition } = useApi();

    if (result) {
        setInscription(result as Inscription[]);
    }

    useEffect(() => {
        const fetchInscriptions = async () => {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT });
        }

        // Si l'utilisateur a réussi à accéder directement à cette partie protégée sans être authentifié (via l'URL en général)
        // alors on le redirige vers la page d'authentification
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            fetchInscriptions();
        }

    }, [isAuthenticated]);

    return (<p>{JSON.stringify(inscriptions)}</p>)

};