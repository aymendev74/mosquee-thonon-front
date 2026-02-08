import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import { PARAM_ENDPOINT } from "../../../services/services";
import { ParamsDtoB } from "../../../services/parametres";
import { isInscriptionFerme } from "../../../utils/FormUtils";

const useParametres = () => {
    const { execute, isLoading } = useApi();
    const [reinscriptionPrioritaire, setReinscriptionPrioritaire] = useState<boolean>(false);
    const [isInscriptionsEnfantFermees, setIsInscriptionsEnfantFermees] = useState<boolean>(false);

    useEffect(() => {
        const loadParametres = async () => {
            const { successData: params } = await execute<ParamsDtoB>({
                method: "GET",
                url: PARAM_ENDPOINT
            });
            if (params) {
                setReinscriptionPrioritaire(params.reinscriptionPrioritaire ?? false);
                setIsInscriptionsEnfantFermees(isInscriptionFerme(params.inscriptionEnfantEnabledFromDate));
            }
        };
        loadParametres();
    }, []);

    return { reinscriptionPrioritaire, isInscriptionsEnfantFermees, isLoading };
};

export default useParametres;
