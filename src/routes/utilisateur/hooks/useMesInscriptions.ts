import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import { MES_INSCRIPTIONS_ENDPOINT } from "../../../services/services";
import {
    InscriptionAdulteParAnneeScolaireDto,
    InscriptionEnfantParAnneeScolaireDto,
    MesInscriptionsDto,
    MesInscriptionsDtoSchema,
} from "../../../services/mesInscriptions";

const useMesInscriptions = () => {
    const { execute, isLoading } = useApi();
    const [inscriptionsEnfants, setInscriptionsEnfants] = useState<InscriptionEnfantParAnneeScolaireDto[]>([]);
    const [inscriptionsAdultes, setInscriptionsAdultes] = useState<InscriptionAdulteParAnneeScolaireDto[]>([]);

    useEffect(() => {
        const loadInscriptions = async () => {
            const { successData } = await execute<MesInscriptionsDto>(
                { method: "GET", url: MES_INSCRIPTIONS_ENDPOINT },
                MesInscriptionsDtoSchema
            );
            if (successData) {
                setInscriptionsEnfants(successData.inscriptionsEnfants);
                setInscriptionsAdultes(successData.inscriptionsAdultes);
            }
        };
        loadInscriptions();
    }, []);

    return { inscriptionsEnfants, inscriptionsAdultes, isLoading };
};

export default useMesInscriptions;
