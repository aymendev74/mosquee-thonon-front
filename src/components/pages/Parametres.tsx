import { Button, Col, Divider, Form, Row, Spin, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT, PARAM_ENDPOINT } from "../../services/services";
import useApi from "../../hooks/useApi";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { ParamDto, ParamName } from "../../services/parametres";
import { InputFormItem } from "../common/InputFormItem";

export const Parametres: FunctionComponent = () => {

    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();

    const onFinish = (values: any) => {
        const reinscriptionPrioritaire: boolean = form.getFieldValue("reinscriptionPrioritaire");
        const anneeScolaire = form.getFieldValue("anneeScolaire");
        const params: ParamDto[] = [
            { name: ParamName.REINSCRIPTION_ENABLED, value: reinscriptionPrioritaire ? reinscriptionPrioritaire.toString() : "false" },
            { name: ParamName.ANNEE_SCOLAIRE, value: anneeScolaire }
        ];
        params
        setApiCallDefinition({ method: "POST", url: PARAM_ENDPOINT, data: params });
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: PARAM_ENDPOINT });
    }, []);

    useEffect(() => {
        if (apiCallDefinition?.url === PARAM_ENDPOINT && apiCallDefinition?.method === "GET" && result) {
            form.setFieldsValue(result);
            resetApi();
        }
        if (apiCallDefinition?.url === PARAM_ENDPOINT && apiCallDefinition?.method === "POST") {
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
                        <SwitchFormItem name="reinscriptionPrioritaire" label="Activer/Désactiver les réinscriptions prioritaires" />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <InputFormItem name="anneeScolaire" label="Activer/Désactiver les réinscriptions prioritaires" />
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Spin>
        </Form >
    </>);
}