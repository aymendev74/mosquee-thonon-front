import { FunctionComponent, useEffect, useState } from "react";
import { Inscription } from "../../services/inscription";
import { getPersonnesInscrites } from "../../services/services";

export const Inscriptions: FunctionComponent = () => {

    const [inscriptions, setInscription] = useState<Inscription[]>();

    useEffect(() => {
        const fetchInscriptions = async () => {
            const inscriptions = await getPersonnesInscrites();
            setInscription(inscriptions);
        }
        fetchInscriptions();
    }, []);

    return (<p>{JSON.stringify(inscriptions)}</p>)

};