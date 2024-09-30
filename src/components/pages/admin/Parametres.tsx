import { Button, Col, Divider, Form, Row, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT, PARAM_ENDPOINT } from "../../../services/services";
import useApi from "../../../hooks/useApi";
import { SwitchFormItem } from "../../common/SwitchFormItem";
import { ParamDto, ParamName, ParamsDto } from "../../../services/parametres";
import { InputFormItem } from "../../common/InputFormItem";
import dayjs from "dayjs";
import { APPLICATION_DATE_FORMAT } from "../../../utils/FormUtils";
import { DatePickerFormItem } from "../../common/DatePickerFormItem";
import { SettingOutlined } from "@ant-design/icons";

export const Parametres: FunctionComponent = () => {

    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [inscriptionFromDateVisible, setInscriptionFromDateVisible] = useState<boolean>(false);

    const onFinish = (values: any) => {
        const paramsDto: ParamsDto = form.getFieldsValue();
        if (paramsDto.inscriptionEnabledFromDate) {
            paramsDto.inscriptionEnabledFromDate = dayjs(paramsDto.inscriptionEnabledFromDate).format(APPLICATION_DATE_FORMAT);
        } else {
            paramsDto.inscriptionEnabledFromDate = "";
        }
        const params: ParamDto[] = [
            { name: ParamName.REINSCRIPTION_ENABLED, value: paramsDto.reinscriptionPrioritaire ? paramsDto.reinscriptionPrioritaire.toString() : "false" },
            { name: ParamName.INSCRIPTION_ENABLED_FROM_DATE, value: paramsDto.inscriptionEnabledFromDate },
            { name: ParamName.SEND_EMAIL_ENABLED, value: paramsDto.sendMailEnabled ? paramsDto.sendMailEnabled.toString() : "false" }
        ];
        setApiCallDefinition({ method: "POST", url: PARAM_ENDPOINT, data: params });
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: PARAM_ENDPOINT });
    }, []);

    useEffect(() => {
        if (apiCallDefinition?.url === PARAM_ENDPOINT && apiCallDefinition?.method === "GET" && result) {
            const resultAsParamsDto: ParamsDto = result as ParamsDto;
            if (resultAsParamsDto.inscriptionEnabledFromDate) {
                resultAsParamsDto.inscriptionEnabledFromDate = dayjs(resultAsParamsDto.inscriptionEnabledFromDate, APPLICATION_DATE_FORMAT);
                form.setFieldValue("inscriptionEnabled", true);
                setInscriptionFromDateVisible(true);
            }
            form.setFieldsValue(result);
            resetApi();
        }
        if (apiCallDefinition?.url === PARAM_ENDPOINT && apiCallDefinition?.method === "POST") {
            notification.open({ message: "Les paramètres de l'application ont bien été enregistrés", type: "success" });
            resetApi();
        }
    }, [result]);

    function onInscriptionEnabledChange(checked: boolean): void {
        if (!checked) {
            form.setFieldValue("reinscriptionPrioritaire", false);
            form.setFieldValue("inscriptionEnabledFromDate", null);
        }
        setInscriptionFromDateVisible(checked);
    }

    function onReinscriptionChanged(checked: boolean): void {
        if (checked) {
            form.setFieldValue("inscriptionEnabled", true);
            setInscriptionFromDateVisible(true);
        }
    }

    return (<>
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
                        <Divider orientation="left">Paramètres</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={4}>
                        <Tooltip color="geekblue" title="Ce paramètre permet de désactiver temporairement toutes les inscriptions. 
                        Ainsi, même si une période est active avec ses tarifs, le système ne renvoit pas de tarif et personne ne peut donc s'incrire">
                            <SwitchFormItem name="inscriptionEnabled" label="Activer/Désactiver les inscriptions" onChange={onInscriptionEnabledChange} />
                        </Tooltip>
                    </Col>
                    {inscriptionFromDateVisible && (<Col span={4}>
                        <Tooltip color="geekblue" title="Indiquez à partir de quelle date les inscriptions doivent être activées">
                            <DatePickerFormItem name="inscriptionEnabledFromDate" label="A partir de" rules={[{ required: true, message: "La date est obligatoire" }]} />
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
                    <Col span={8}>
                        <Tooltip color="geekblue" title="Si désactivé, les mails ne sont pas envoyés lors des inscriptions (utile lors des sessions de tests par exemple)">
                            <SwitchFormItem name="sendMailEnabled" label="Activer/Désactiver l'envoi des e-mails" />
                        </Tooltip>
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Spin>
        </Form >
    </>);
}