import { Button, Card, Col, Form, Row, Spin, Tooltip } from "antd";
import { FunctionComponent } from "react";
import { SwitchFormItem } from "../../components/common/SwitchFormItem";
import { DatePickerFormItem } from "../../components/common/DatePickerFormItem";
import { SettingOutlined, SaveOutlined, MailOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/AuthContext";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { useParametresManagement } from "./parametres/hooks/useParametresManagement";

export const Parametres: FunctionComponent = () => {
    const { roles } = useAuth();
    const [form] = Form.useForm();

    const {
        isLoading,
        inscriptionEnfantFromDateVisible,
        inscriptionAdulteFromDateVisible,
        onFinish,
        onInscriptionEnfantEnabledChange,
        onInscriptionAdulteEnabledChange,
    } = useParametresManagement(form);

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
                                                    <SwitchFormItem name="reinscriptionPrioritaire" label="Seulement les réinscriptions" />
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
                                        <Col xs={24} sm={12} md={6}>
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