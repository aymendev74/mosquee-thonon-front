import { Button, Col, Divider, Form, Row, Spin, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT, PARAM_SAVE_ENDPOINT } from "../../services/services";
import useApi from "../../hooks/useApi";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { ParamName } from "../../services/parametres";

export const Parametres: FunctionComponent = () => {

    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [reinscriptionPrioritaire, setReinscriptionPrioritaire] = useState<boolean>(false);

    const onFinish = (values: any) => {
        setApiCallDefinition({ method: "POST", url: PARAM_SAVE_ENDPOINT, data: { name: ParamName.REINSCRIPTION_ENABLED, value: reinscriptionPrioritaire.toString() } });
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT });
    }, []);

    useEffect(() => {
        if (apiCallDefinition?.url === PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT && result !== undefined) {
            form.setFieldValue("reinscriptionPrioritaire", result);
            resetApi();
        }
        if (apiCallDefinition?.url === PARAM_SAVE_ENDPOINT) {
            notification.open({ message: "Les paramètres de l'application ont bien été enregistrés", type: "success" });
            resetApi();
        }
    }, [result]);

    return (<>
        <Form
            name="basic"
            autoComplete="off"
            className="container-full-width"
            onFinish={onFinish}
            form={form}
        >
            <Spin spinning={isLoading}>
                <h2>Paramètres de l'application</h2>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <Divider orientation="left">Réinscriptions prioritaires</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <SwitchFormItem name="reinscriptionPrioritaire" label="Activer/Désactiver les réinscriptions prioritaires" onChange={(value) => { setReinscriptionPrioritaire(value) }} />
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Spin>
        </Form >
    </>);
}