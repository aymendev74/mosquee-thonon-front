import { FunctionComponent, useEffect, useState } from "react";
import { Inscription } from "../../services/inscription";
import { getPersonnesInscrites } from "../../services/services";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";

export const Inscriptions: FunctionComponent = () => {

    const [inscriptions, setInscription] = useState<Inscription[]>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInscriptions = async () => {
            const inscriptions = await getPersonnesInscrites();
            setInscription(inscriptions);
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