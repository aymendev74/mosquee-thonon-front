import { Button, Card, Col, Form, Row, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PARAM_ENDPOINT } from "../../../services/services";
import useApi from "../../../hooks/useApi";
import { SwitchFormItem } from "../../common/SwitchFormItem";
import { ParamDto, ParamName, ParamsDtoB, ParamsDtoF } from "../../../services/parametres";
import dayjs from "dayjs";
import { APPLICATION_DATE_FORMAT } from "../../../utils/FormUtils";
import { DatePickerFormItem } from "../../common/DatePickerFormItem";
import { SettingOutlined, SaveOutlined, MailOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/AuthContext";
import { UnahtorizedAccess } from "../UnahtorizedAccess";

export const Parametres: FunctionComponent = () => {
    const { roles } = useAuth();
    const [form] = Form.useForm();
    const { execute, isLoading } = useApi();
    const [inscriptionEnfantFromDateVisible, setInscriptionEnfantFromDateVisible] = useState<boolean>(false);
    const [inscriptionAdulteFromDateVisible, setInscriptionAdulteFromDateVisible] = useState<boolean>(false);

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

    useEffect(() => {
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
        loadParams();
    }, []);

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

    return roles?.includes("ROLE_ADMIN") ? (
        <div className="centered-content">
            <Form form={form} onFinish={onFinish} layout="vertical" className="container-full-width">
                <Spin spinning={isLoading}>
                    <h2 className="admin-param-title">
                        <SettingOutlined style={{ marginRight: 8 }} /> Paramètres de l'application
                    </h2>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                            <Card title={<><MailOutlined /> Paramètres généraux</>} bordered hoverable>
                                <Tooltip color="geekblue" title="Si désactivé, les mails ne sont pas envoyés lors des inscriptions (utile en test)">
                                    <SwitchFormItem name="sendMailEnabled" label="Activer l'envoi des e-mails" />
                                </Tooltip>
                            </Card>
                        </Col>

                        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                            <Card title={<><TeamOutlined /> Paramètres cours enfants</>} bordered hoverable>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={24} md={10}>
                                        <Tooltip color="geekblue" title="Active ou désactive le formulaire d'inscription pour les enfants">
                                            <SwitchFormItem name="inscriptionEnfantEnabled" label="Activer les inscriptions aux cours enfants" onChange={onInscriptionEnfantEnabledChange} />
                                        </Tooltip>
                                    </Col>
                                    {inscriptionEnfantFromDateVisible && (
                                        <>
                                            <Col xs={24} sm={12} md={6}>
                                                <Tooltip color="geekblue" title="Indiquez la date à partir de laquelle les inscriptions sont ouvertes">
                                                    <DatePickerFormItem name="inscriptionEnfantEnabledFromDate" label="A partir du" rules={[{ required: true, message: "Date obligatoire" }]} />
                                                </Tooltip>
                                            </Col>
                                            <Col xs={24} sm={12} md={8}>
                                                <Tooltip color="geekblue" title="Seuls les élèves inscrits l'année précédente peuvent se réinscrire">
                                                    <SwitchFormItem name="reinscriptionPrioritaire" label="Réinscriptions prioritaires" />
                                                </Tooltip>
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </Card>
                        </Col>

                        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                            <Card title={<><UserOutlined /> Paramètres cours adultes</>} bordered hoverable>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={24} md={10}>
                                        <Tooltip color="geekblue" title="Active ou désactive le formulaire d'inscription pour les adultes">
                                            <SwitchFormItem name="inscriptionAdulteEnabled" label="Activer les inscriptions aux cours adultes" onChange={onInscriptionAdulteEnabledChange} />
                                        </Tooltip>
                                    </Col>
                                    {inscriptionAdulteFromDateVisible && (
                                        <Col xs={24} sm={12} md={8}>
                                            <Tooltip color="geekblue" title="Indiquez la date à partir de laquelle les inscriptions sont possibles">
                                                <DatePickerFormItem name="inscriptionAdulteEnabledFromDate" label="A partir du" rules={[{ required: true, message: "Date obligatoire" }]} />
                                            </Tooltip>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading}>
                            Enregistrer les paramètres
                        </Button>
                    </div>
                </Spin>
            </Form>
        </div>
    ) : (
        <UnahtorizedAccess />
    );
};