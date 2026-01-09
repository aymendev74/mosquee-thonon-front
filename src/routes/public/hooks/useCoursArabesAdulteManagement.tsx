import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import useApi from '../../../hooks/useApi';
import { useMatieresStore } from '../../../components/stores/useMatieresStore';
import {
    buildUrlWithParams,
    INSCRIPTION_ADULTE_ENDPOINT,
    INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT,
    NEW_INSCRIPTION_ADULTE_ENDPOINT,
    NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT,
    PARAM_ENDPOINT
} from '../../../services/services';
import {
    InscriptionAdulteBack,
    InscriptionAdulteFront
} from '../../../services/inscription';
import { TarifInscriptionDto } from '../../../services/tarif';
import { ParamsDtoB } from '../../../services/parametres';
import { TypeMatiereEnum } from '../../../services/classe';
import {
    isInscriptionFerme,
    prepareInscriptionAdulteBeforeForm,
    prepareInscriptionAdulteBeforeSave
} from '../../../utils/FormUtils';

interface UseCoursArabesAdulteManagementProps {
    form: FormInstance;
}

export const useCoursArabesAdulteManagement = ({ form }: UseCoursArabesAdulteManagementProps) => {
    const { execute, isLoading } = useApi();
    const location = useLocation();
    const navigate = useNavigate();
    const { getMatieresByType } = useMatieresStore();

    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [consentementChecked, setConsentementChecked] = useState(false);
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();
    const [isInscriptionsFermees, setIsInscriptionsFermees] = useState<boolean>(false);

    const id = location.state ? location.state.id : undefined;
    const isReadOnly = location.state ? location.state.isReadOnly : false;
    const isAdmin = location.state ? location.state.isAdmin : false;

    const handleTarifInscription = (result?: TarifInscriptionDto | null) => {
        if (result) {
            setTarifInscription(result);
        } else {
            notification.open({
                message: "Aucun tarif n'a été trouvé pour la période en cours",
                type: "error"
            });
            setTarifInscription(undefined);
        }
    };

    const onStatutProfessionnelChanged = async (value: any) => {
        if (value) {
            const { successData } = await execute<TarifInscriptionDto>({
                method: "GET",
                url: NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT,
                params: { statutProfessionnel: value }
            });
            handleTarifInscription(successData);
        } else {
            handleTarifInscription(undefined);
        }
    };

    const onFinish = async (inscription: InscriptionAdulteFront) => {
        const inscriptionToSave = prepareInscriptionAdulteBeforeSave(inscription);
        if (!isAdmin && !consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning"
            });
            return;
        }

        if (id) {
            const { sendMailConfirmation } = { ...inscription };
            const { success } = await execute({
                method: "PUT",
                url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id }),
                data: inscriptionToSave,
                params: { sendMailConfirmation }
            });
            if (success) {
                notification.open({
                    message: "Les modifications ont bien été enregistrées",
                    type: "success"
                });
                navigate("/adminCours", { state: { application: "COURS_ADULTE" } });
            }
        } else {
            const { success } = await execute({
                method: "POST",
                url: NEW_INSCRIPTION_ADULTE_ENDPOINT,
                data: inscriptionToSave
            });
            if (success) {
                setInscriptionSuccess(true);
                form.resetFields();
            }
        }
    };

    const getMatieresOptions = () => {
        return getMatieresByType(TypeMatiereEnum.ADULTE).map((matiere) => ({
            label: matiere.fr,
            value: matiere.code,
        }));
    };

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                const { successData: inscription } = await execute<InscriptionAdulteBack>({
                    method: "GET",
                    url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id: id })
                });
                if (inscription) {
                    const inscriptionFormValues: InscriptionAdulteFront = prepareInscriptionAdulteBeforeForm(inscription);
                    form.setFieldsValue(inscriptionFormValues);
                    const { successData: tarif } = await execute<TarifInscriptionDto>({
                        method: "GET",
                        url: buildUrlWithParams(INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT, { id }),
                        params: { statutProfessionnel: inscriptionFormValues.statutProfessionnel }
                    });
                    handleTarifInscription(tarif);
                }
            } else {
                const { successData: params } = await execute<ParamsDtoB>({
                    method: "GET",
                    url: PARAM_ENDPOINT
                });
                if (params) {
                    setIsInscriptionsFermees(isInscriptionFerme(params.inscriptionAdulteEnabledFromDate));
                }
            }
        };
        loadData();
    }, []);

    return {
        // States
        isLoading,
        inscriptionSuccess,
        setInscriptionSuccess,
        consentementChecked,
        setConsentementChecked,
        tarifInscription,
        isInscriptionsFermees,
        id,
        isReadOnly,
        isAdmin,

        // Actions
        onStatutProfessionnelChanged,
        onFinish,
        getMatieresOptions,
    };
};
