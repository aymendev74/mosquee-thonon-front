import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import { MES_INSCRIPTIONS_ENDPOINT } from "../../../services/services";
import { InscriptionParAnneeScolaireDto, MesInscriptionsSchema } from "../../../services/mesInscriptions";

const useMesInscriptions = () => {
    const { execute, isLoading } = useApi();
    const [inscriptions, setInscriptions] = useState<InscriptionParAnneeScolaireDto[]>([]);

    useEffect(() => {
        const loadInscriptions = async () => {
            const { successData } = await execute<InscriptionParAnneeScolaireDto[]>(
                { method: "GET", url: MES_INSCRIPTIONS_ENDPOINT },
                MesInscriptionsSchema
            );
            if (successData) {
                setInscriptions(successData);
            }
        };
        loadInscriptions();
    }, []);

    return { inscriptions, isLoading };
};

export default useMesInscriptions;
