import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import { BULLETINS_ELEVE_ENDPOINT } from "../../../services/services";
import { BulletinDtoB } from "../../../services/classe";
import { buildUrlWithParams } from "../../../services/services";

const useBulletins = (idEleve: number | undefined) => {
    const { execute, isLoading } = useApi();
    const [bulletins, setBulletins] = useState<BulletinDtoB[]>([]);

    useEffect(() => {
        if (!idEleve) {
            setBulletins([]);
            return;
        }

        const loadBulletins = async () => {
            const url = buildUrlWithParams(BULLETINS_ELEVE_ENDPOINT, { id: idEleve });
            const { successData } = await execute<BulletinDtoB[]>(
                { method: "GET", url }
            );
            if (successData) {
                setBulletins(successData);
            }
        };
        loadBulletins();
    }, [idEleve]);

    return { bulletins, isLoading };
};

export default useBulletins;
