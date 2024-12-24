import { Button, Card, Col, Divider, Form, Row, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PARAM_ENDPOINT } from "../../../services/services";
import useApi from "../../../hooks/useApi";
import { SwitchFormItem } from "../../common/SwitchFormItem";
import { ParamDto, ParamName, ParamsDto, ParamsDtoB, ParamsDtoF } from "../../../services/parametres";
import dayjs from "dayjs";
import { APPLICATION_DATE_FORMAT } from "../../../utils/FormUtils";
import { DatePickerFormItem } from "../../common/DatePickerFormItem";
import { SettingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/AuthContext";
import { UnahtorizedAccess } from "../UnahtorizedAccess";

export const Parametres: FunctionComponent = () => {

    const { isAuthenticated } = useAuth();
    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [inscriptionEnfantFromDateVisible, setInscriptionEnfantFromDateVisible] = useState<boolean>(false);
    const [inscriptionAdulteFromDateVisible, setInscriptionAdulteFromDateVisible] = useState<boolean>(false);

    const onFinish = (params: ParamsDtoF) => {
        const { sendMailEnabled, reinscriptionPrioritaire } = params;
        let inscriptionEnfantEnabledFromDate = null;
        let inscriptionAdulteEnabledFromDate = null;

        if (params.inscriptionEnfantEnabledFromDate) {
            inscriptionEnfantEnabledFromDate = dayjs(params.inscriptionEnfantEnabledFromDate).format(APPLICATION_DATE_FORMAT);
        } else {
            inscriptionEnfantEnabledFromDate = "";
        }

        if (params.inscriptionAdulteEnabledFromDate) {
            inscriptionAdulteEnabledFromDate = dayjs(params.inscriptionAdulteEnabledFromDate).format(APPLICATION_DATE_FORMAT);
        } else {
            inscriptionAdulteEnabledFromDate = "";
        }

        const paramsDto: ParamDto[] = [
            { name: ParamName.REINSCRIPTION_ENABLED, value: reinscriptionPrioritaire ? reinscriptionPrioritaire.toString() : "false" },
            { name: ParamName.INSCRIPTION_ENFANT_ENABLED_FROM_DATE, value: inscriptionEnfantEnabledFromDate },
            { name: ParamName.INSCRIPTION_ADULTE_ENABLED_FROM_DATE, value: inscriptionAdulteEnabledFromDate },
            { name: ParamName.SEND_EMAIL_ENABLED, value: sendMailEnabled ? sendMailEnabled.toString() : "false" }
        ];
        setApiCallDefinition({ method: "POST", url: PARAM_ENDPOINT, data: paramsDto });
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: PARAM_ENDPOINT });
    }, []);

    useEffect(() => {
        if (apiCallDefinition?.url === PARAM_ENDPOINT && apiCallDefinition?.method === "GET" && result) {
            const resultAsParamsDto: ParamsDtoB = result as ParamsDtoB;
            let paramsDtoF: ParamsDtoF = { sendMailEnabled: resultAsParamsDto.sendMailEnabled, reinscriptionPrioritaire: resultAsParamsDto.reinscriptionPrioritaire };
            if (resultAsParamsDto.inscriptionEnfantEnabledFromDate) {
                paramsDtoF = { ...paramsDtoF, inscriptionEnfantEnabledFromDate: dayjs(resultAsParamsDto.inscriptionEnfantEnabledFromDate, APPLICATION_DATE_FORMAT) };
                form.setFieldValue("inscriptionEnfantEnabled", true);
                setInscriptionEnfantFromDateVisible(true);
            }
            if (resultAsParamsDto.inscriptionAdulteEnabledFromDate) {
                paramsDtoF = { ...paramsDtoF, inscriptionAdulteEnabledFromDate: dayjs(resultAsParamsDto.inscriptionAdulteEnabledFromDate, APPLICATION_DATE_FORMAT) };
                form.setFieldValue("inscriptionAdulteEnabled", true);
                setInscriptionAdulteFromDateVisible(true);
            }
            form.setFieldsValue(paramsDtoF);
            resetApi();
        }
        if (apiCallDefinition?.url === PARAM_ENDPOINT && apiCallDefinition?.method === "POST") {
            notification.open({ message: "Les paramètres de l'application ont bien été enregistrés", type: "success" });
            resetApi();
        }
    }, [result]);

    function onInscriptionEnfantEnabledChange(checked: boolean): void {
        if (!checked) {
            form.setFieldValue("reinscriptionPrioritaire", false);
            form.setFieldValue("inscriptionEnfantEnabledFromDate", null);
        }
        setInscriptionEnfantFromDateVisible(checked);
    }

    function onInscriptionAdulteEnabledChange(checked: boolean): void {
        if (!checked) {
            form.setFieldValue("inscriptionAdulteEnabledFromDate", null);
        }
        setInscriptionAdulteFromDateVisible(checked);
    }

    function onReinscriptionChanged(checked: boolean): void {
        if (checked) {
            form.setFieldValue("inscriptionEnfantEnabled", true);
            setInscriptionEnfantFromDateVisible(true);
        }
    }

    return isAuthenticated ? (
        <div className="centered-content">
            <Form
                name="basic"
                autoComplete="off"
                className="container-full-width"
                onFinish={onFinish}
                form={form}
            >
                <Spin spinning={isLoading}>
                    <h2 className="admin-param-title"><SettingOutlined /> Paramètres de l'application</h2>
                    <Row gutter={[16, 32]}>
                        <Col span={24}>
                            <Divider orientation="left">Paramètres généraux</Divider>
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={8}>
                            <Tooltip color="geekblue" title="Si désactivé, les mails ne sont pas envoyés lors des inscriptions (utile lors des sessions de tests par exemple)">
                                <SwitchFormItem name="sendMailEnabled" label="Activer/Désactiver l'envoi des e-mails" />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={24}>
                            <Divider orientation="left">Paramètres cours enfants</Divider>
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={4}>
                            <Tooltip color="geekblue" title="Si ce paramètre est activé, personne ne peut voir le formulaire d'inscription et personne ne peut donc s'inscrire">
                                <SwitchFormItem name="inscriptionEnfantEnabled" label="Activer/Désactiver les inscriptions" onChange={onInscriptionEnfantEnabledChange} />
                            </Tooltip>
                        </Col>
                        {inscriptionEnfantFromDateVisible && (<Col span={4}>
                            <Tooltip color="geekblue" title="Indiquez à partir de quelle date les inscriptions doivent être activées">
                                <DatePickerFormItem name="inscriptionEnfantEnabledFromDate" label="A partir de" rules={[{ required: true, message: "La date est obligatoire" }]} />
                            </Tooltip>
                        </Col>)
                        }
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={8}>
                            <Tooltip color="geekblue" title="Ce paramètre permet d'activer les réinscriptions. Lorsqu'il est activé,
                        seuls les élèves inscrits pendant la dernière période scolaire sont autorisés à se réinscrire">
                                <SwitchFormItem name="reinscriptionPrioritaire" label="Activer/Désactiver les réinscriptions prioritaires" onChange={onReinscriptionChanged} />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={24}>
                            <Divider orientation="left">Paramètres cours adultes</Divider>
                        </Col>
                    </Row>
                    <Row gutter={[16, 32]}>
                        <Col span={4}>
                            <Tooltip color="geekblue" title="Si ce paramètre est activé, personne ne peut voir le formulaire d'inscription et personne ne peut donc s'inscrire">
                                <SwitchFormItem name="inscriptionAdulteEnabled" label="Activer/Désactiver les inscriptions" onChange={onInscriptionAdulteEnabledChange} />
                            </Tooltip>
                        </Col>
                        {inscriptionAdulteFromDateVisible && (<Col span={4}>
                            <Tooltip color="geekblue" title="Indiquez à partir de quelle date les inscriptions doivent être activées">
                                <DatePickerFormItem name="inscriptionAdulteEnabledFromDate" label="A partir de" rules={[{ required: true, message: "La date est obligatoire" }]} />
                            </Tooltip>
                        </Col>)
                        }
                    </Row>
                    <Button type="primary" htmlType="submit">Enregistrer</Button>
                </Spin>
            </Form >
        </div>) : <UnahtorizedAccess />
};