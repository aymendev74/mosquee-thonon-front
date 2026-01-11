import { useState, useEffect } from "react";
import { FormInstance, notification } from "antd";
import useApi from "../../../../hooks/useApi";
import { PARAM_ENDPOINT } from "../../../../services/services";
import { ParamDto, ParamName, ParamsDtoB, ParamsDtoF } from "../../../../services/parametres";
import dayjs from "dayjs";
import { APPLICATION_DATE_FORMAT } from "../../../../utils/FormUtils";

export const useParametresManagement = (form: FormInstance) => {
    const { execute, isLoading } = useApi();
    const [inscriptionEnfantFromDateVisible, setInscriptionEnfantFromDateVisible] = useState<boolean>(false);
    const [inscriptionAdulteFromDateVisible, setInscriptionAdulteFromDateVisible] = useState<boolean>(false);

    const loadParams = async () => {
        const { successData: paramsDto } = await execute<ParamsDtoB>({ method: "GET", url: PARAM_ENDPOINT });
        if (paramsDto) {
            let paramsDtoF: ParamsDtoF = {
                sendMailEnabled: paramsDto.sendMailEnabled,
                reinscriptionPrioritaire: paramsDto.reinscriptionPrioritaire
            };
            if (paramsDto.inscriptionEnfantEnabledFromDate) {
                paramsDtoF = {
                    ...paramsDtoF,
                    inscriptionEnfantEnabledFromDate: dayjs(paramsDto.inscriptionEnfantEnabledFromDate, APPLICATION_DATE_FORMAT)
                };
                form.setFieldValue("inscriptionEnfantEnabled", true);
                setInscriptionEnfantFromDateVisible(true);
            }
            if (paramsDto.inscriptionAdulteEnabledFromDate) {
                paramsDtoF = {
                    ...paramsDtoF,
                    inscriptionAdulteEnabledFromDate: dayjs(paramsDto.inscriptionAdulteEnabledFromDate, APPLICATION_DATE_FORMAT)
                };
                form.setFieldValue("inscriptionAdulteEnabled", true);
                setInscriptionAdulteFromDateVisible(true);
            }
            form.setFieldsValue(paramsDtoF);
        }
    };

    useEffect(() => {
        loadParams();
    }, []);

    const onFinish = async (params: ParamsDtoF) => {
        const { sendMailEnabled, reinscriptionPrioritaire } = params;
        let inscriptionEnfantEnabledFromDate = params.inscriptionEnfantEnabledFromDate
            ? dayjs(params.inscriptionEnfantEnabledFromDate).format(APPLICATION_DATE_FORMAT)
            : "";

        let inscriptionAdulteEnabledFromDate = params.inscriptionAdulteEnabledFromDate
            ? dayjs(params.inscriptionAdulteEnabledFromDate).format(APPLICATION_DATE_FORMAT)
            : "";

        const paramsDto: ParamDto[] = [
            { name: ParamName.REINSCRIPTION_ENABLED, value: reinscriptionPrioritaire ? "true" : "false" },
            { name: ParamName.INSCRIPTION_ENFANT_ENABLED_FROM_DATE, value: inscriptionEnfantEnabledFromDate },
            { name: ParamName.INSCRIPTION_ADULTE_ENABLED_FROM_DATE, value: inscriptionAdulteEnabledFromDate },
            { name: ParamName.SEND_EMAIL_ENABLED, value: sendMailEnabled ? "true" : "false" }
        ];

        const resultSaveParams = await execute({ method: "POST", url: PARAM_ENDPOINT, data: paramsDto });
        if (resultSaveParams.success) {
            notification.success({
                message: "Succès",
                description: "Les paramètres de l'application ont bien été enregistrés"
            });
        }
    };

    const onInscriptionEnfantEnabledChange = (checked: boolean): void => {
        if (!checked) {
            form.setFieldValue("reinscriptionPrioritaire", false);
            form.setFieldValue("inscriptionEnfantEnabledFromDate", null);
        }
        setInscriptionEnfantFromDateVisible(checked);
    };

    const onInscriptionAdulteEnabledChange = (checked: boolean): void => {
        if (!checked) {
            form.setFieldValue("inscriptionAdulteEnabledFromDate", null);
        }
        setInscriptionAdulteFromDateVisible(checked);
    };

    return {
        isLoading,
        inscriptionEnfantFromDateVisible,
        inscriptionAdulteFromDateVisible,
        onFinish,
        onInscriptionEnfantEnabledChange,
        onInscriptionAdulteEnabledChange,
    };
};
