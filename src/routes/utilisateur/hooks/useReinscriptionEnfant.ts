import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import useApi from "../../../hooks/useApi";
import {
    NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT,
    REINSCRIPTION_ENFANT_ENDPOINT,
} from "../../../services/services";
import { EleveDto, InscriptionEnfantParAnneeScolaireDto, ResponsableLegalDto } from "../../../services/mesInscriptions";
import { TarifInscriptionDto } from "../../../services/tarif";
import { InscriptionEnfantBack } from "../../../services/inscription";

export interface ReinscriptionEleve extends EleveDto {
    selected: boolean;
}

export const useReinscriptionEnfant = () => {
    const { execute, isLoading } = useApi();
    const location = useLocation();
    const navigate = useNavigate();

    const inscription = (location.state as any)?.inscription as InscriptionEnfantParAnneeScolaireDto | undefined;

    const [eleves, setEleves] = useState<ReinscriptionEleve[]>([]);
    const [responsableLegal, setResponsableLegal] = useState<ResponsableLegalDto | null>(null);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [reinscriptionFinished, setReinscriptionFinished] = useState<InscriptionEnfantBack>();
    const [adherent, setAdherent] = useState<boolean>(false);

    const anneeScolaireReinscription = inscription
        ? `${inscription.anneeDebut + 1} / ${inscription.anneeFin + 1}`
        : "";

    const selectedEleves = eleves.filter((e) => e.selected);

    useEffect(() => {
        if (inscription) {
            setResponsableLegal(inscription.responsableLegal);
            setEleves(
                inscription.eleves.map((e) => ({ ...e, selected: true }))
            );
            setAdherent(false);
        }
    }, []);

    const calculTarif = useCallback(async (nbEleves: number, isAdherent: boolean) => {
        if (nbEleves > 0) {
            const { successData: tarif } = await execute<TarifInscriptionDto>({
                method: "GET",
                url: NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT,
                params: { adherent: isAdherent, nbEleves },
            });
            if (tarif) {
                setTarifInscription(tarif);
            } else {
                setTarifInscription(undefined);
            }
        } else {
            setTarifInscription(undefined);
        }
    }, [execute]);

    useEffect(() => {
        calculTarif(selectedEleves.length, adherent);
    }, [selectedEleves.length, adherent]);

    const toggleEleve = (index: number) => {
        setEleves((prev) =>
            prev.map((e, i) => (i === index ? { ...e, selected: !e.selected } : e))
        );
    };

    const updateEleveNiveau = (index: number, niveau: string) => {
        setEleves((prev) =>
            prev.map((e, i) => (i === index ? { ...e, niveau } : e))
        );
    };

    const onAdherentChange = (value: boolean) => {
        setAdherent(value);
    };

    const updateResponsableLegal = (field: keyof ResponsableLegalDto, value: any) => {
        setResponsableLegal((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const getMontantTotal = () => {
        if (tarifInscription) {
            return tarifInscription.tarifBase + tarifInscription.tarifEleve * selectedEleves.length;
        }
        return undefined;
    };

    const onSubmit = async () => {
        if (!consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning",
            });
            return;
        }

        if (selectedEleves.length === 0) {
            notification.open({
                message: "Veuillez sélectionner au moins un élève",
                type: "warning",
            });
            return;
        }

        if (!responsableLegal) {
            return;
        }

        const reinscriptionData = {
            responsableLegal: {
                ...responsableLegal,
                adherent,
            },
            eleves: selectedEleves
                .filter((e) => e.id !== undefined)
                .map((e) => ({ id: e.id, niveau: e.niveau })),
        };

        const { success, successData } = await execute<InscriptionEnfantBack>({
            method: "POST",
            url: REINSCRIPTION_ENFANT_ENDPOINT,
            data: reinscriptionData,
        });

        if (success && successData) {
            setReinscriptionFinished(successData);
            notification.open({
                message: "Votre réinscription a bien été enregistrée",
                type: "success",
            });
        }
    };

    const goBackToDashboard = () => {
        navigate("/dashboard");
    };

    return {
        isLoading,
        inscription,
        responsableLegal,
        updateResponsableLegal,
        eleves,
        selectedEleves,
        tarifInscription,
        consentementChecked,
        setConsentementChecked,
        reinscriptionFinished,
        adherent,
        anneeScolaireReinscription,
        toggleEleve,
        updateEleveNiveau,
        onAdherentChange,
        getMontantTotal,
        onSubmit,
        goBackToDashboard,
    };
};
