import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { notification, Form } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import useApi from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/AuthContext';
import {
    ADHESION_ENDPOINT,
    buildUrlWithParams,
    NEW_ADHESION_ENDPOINT,
    TARIFS_ENDPOINT
} from '../../../services/services';
import { Adhesion } from '../../../services/adhesion';
import { TarifDto } from '../../../services/tarif';
import { APPLICATION_DATE_FORMAT } from '../../../utils/FormUtils';

interface UseAdhesionManagementProps {
    form: FormInstance;
}

export const useAdhesionManagement = ({ form }: UseAdhesionManagementProps) => {
    const { execute, isLoading } = useApi();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { roles } = useAuth();

    const [versementMensuelOptions, setVersementMensuelOptions] = useState<DefaultOptionType[]>();
    const [autreMontantVisible, setAutreMontantVisible] = useState<boolean>(false);
    const [inscriptionSuccess, setInscriptionSuccess] = useState<boolean>(false);
    const [consentementChecked, setConsentementChecked] = useState(false);

    // Récupérer les paramètres depuis l'URL et le contexte d'auth
    const isReadOnly = searchParams.get('readonly') === 'true';
    const isAdmin = roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_TRESORIER");
    const statutAdhesion = Form.useWatch("statut", form);

    const getCiviliteOptions = () => {
        return [{ value: "M", label: "Monsieur" }, { value: "MME", label: "Madame" }];
    };

    const formatMontant = (montant: number) => {
        return montant + " €";
    };

    const onMontantChanged = (value: string, option: any) => {
        setAutreMontantVisible(option.label === "Autre");
    };

    const onFinish = async (adhesion: Adhesion) => {
        if (!isAdmin && !consentementChecked) {
            notification.open({
                message: "Veuillez donner votre consentement à la collecte et au traitement de vos données avant de valider",
                type: "warning"
            });
            return;
        }
        adhesion.dateNaissance = dayjs(adhesion.dateNaissance).format(APPLICATION_DATE_FORMAT);

        if (id) {
            const { sendMailConfirmation } = { ...adhesion };
            const { success } = await execute({
                method: "PUT",
                url: buildUrlWithParams(ADHESION_ENDPOINT, { id: id }),
                data: adhesion,
                params: { sendMailConfirmation }
            });
            if (success) {
                notification.open({
                    message: "Les modifications ont bien été enregistrées",
                    type: "success"
                });
                navigate("/adminAdhesion");
            }
        } else {
            const { success } = await execute({
                method: "POST",
                url: NEW_ADHESION_ENDPOINT,
                data: adhesion
            });
            if (success) {
                setInscriptionSuccess(true);
                form.resetFields();
            }
        }
    };

    useEffect(() => {
        const loadTarifs = async () => {
            const { successData: resultTarifs } = await execute<TarifDto[]>({
                method: "GET",
                url: TARIFS_ENDPOINT,
                params: { application: "ADHESION" }
            });
            if (resultTarifs) {
                const tarifOptions: DefaultOptionType[] = [];
                resultTarifs.forEach(tarif =>
                    tarifOptions.push({
                        value: tarif.id,
                        label: tarif.type === "FIXE" ? formatMontant(tarif.montant) : "Autre"
                    })
                );
                setVersementMensuelOptions(tarifOptions);
            }
        };
        loadTarifs();
    }, []);

    useEffect(() => {
        const loadAdhesion = async () => {
            if (id) {
                const { successData: adhesion } = await execute<Adhesion>({
                    method: "GET",
                    url: buildUrlWithParams(ADHESION_ENDPOINT, { id: id })
                });
                if (adhesion) {
                    adhesion.dateNaissance = dayjs(adhesion.dateNaissance, APPLICATION_DATE_FORMAT);
                    if (adhesion.montantAutre) {
                        setAutreMontantVisible(true);
                    }
                    form.setFieldsValue(adhesion);
                }
            }
        };
        loadAdhesion();
    }, []);

    return {
        // States
        isLoading,
        versementMensuelOptions,
        autreMontantVisible,
        inscriptionSuccess,
        setInscriptionSuccess,
        consentementChecked,
        setConsentementChecked,
        statutAdhesion,
        id,
        isReadOnly,
        isAdmin,

        // Actions
        getCiviliteOptions,
        onMontantChanged,
        onFinish,
    };
};
