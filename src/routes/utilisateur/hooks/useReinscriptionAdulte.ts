import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, FormInstance, notification } from "antd";

import useApi from "../../../hooks/useApi";
import {
    NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT,
    REINSCRIPTION_ADULTE_ENDPOINT,
} from "../../../services/services";
import { InscriptionAdulteParAnneeScolaireDto } from "../../../services/mesInscriptions";
import { TarifInscriptionDto } from "../../../services/tarif";
import { InscriptionAdulteBack } from "../../../services/inscription";
import { useMatieresStore } from "../../../components/stores/useMatieresStore";
import { TypeMatiereEnum } from "../../../services/classe";

export const useReinscriptionAdulte = ({ form }: { form: FormInstance }) => {
    const { execute, isLoading } = useApi();
    const location = useLocation();
    const navigate = useNavigate();
    const { getMatieresByType } = useMatieresStore();

    const inscription = (location.state as any)?.inscription as InscriptionAdulteParAnneeScolaireDto | undefined;

    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [reinscriptionFinished, setReinscriptionFinished] = useState<InscriptionAdulteBack>();

    const statutProfessionnel = Form.useWatch("statutProfessionnel", form);

    const anneeScolaireReinscription = inscription
        ? `${inscription.anneeDebut + 1} / ${inscription.anneeFin + 1}`
        : "";

    const matieresOptions = getMatieresByType(TypeMatiereEnum.ADULTE).map((matiere) => ({
        label: matiere.fr,
        value: matiere.code,
    }));

    useEffect(() => {
        if (inscription) {
            form.setFieldsValue({
                nom: inscription.nom,
                prenom: inscription.prenom,
                email: inscription.email,
                dateNaissance: inscription.dateNaissance,
                mobile: inscription.mobile,
                numeroEtRue: inscription.numeroEtRue,
                codePostal: inscription.codePostal,
                ville: inscription.ville,
                sexe: inscription.sexe,
                niveauInterne: inscription.niveauInterne,
                statutProfessionnel: inscription.statutProfessionnel,
                matieres: [...inscription.matieres],
            });
        }
    }, []);

    const calculTarif = useCallback(async (statut: string) => {
        if (statut) {
            const { successData: tarif } = await execute<TarifInscriptionDto>({
                method: "GET",
                url: NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT,
                params: { statutProfessionnel: statut },
            });
            setTarifInscription(tarif ?? undefined);
        } else {
            setTarifInscription(undefined);
        }
    }, [execute]);

    useEffect(() => {
        if (statutProfessionnel) {
            calculTarif(statutProfessionnel);
        }
    }, [statutProfessionnel]);

    const onFinish = async (values: any) => {
        if (!consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning",
            });
            return;
        }

        const dataToSend = {
            ...values,
            codePostal: values.codePostal !== undefined ? Number(values.codePostal) : values.codePostal,
        };

        const { success, successData } = await execute<InscriptionAdulteBack>({
            method: "POST",
            url: REINSCRIPTION_ADULTE_ENDPOINT,
            data: dataToSend,
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
        tarifInscription,
        consentementChecked,
        setConsentementChecked,
        reinscriptionFinished,
        anneeScolaireReinscription,
        matieresOptions,
        onFinish,
        goBackToDashboard,
    };
};
