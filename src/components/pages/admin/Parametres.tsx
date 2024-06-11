import { Button, Col, Divider, Form, Row, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT, PARAM_ENDPOINT } from "../../../services/services";
import useApi from "../../../hooks/useApi";
import { SwitchFormItem } from "../../common/SwitchFormItem";
import { ParamDto, ParamName } from "../../../services/parametres";
import { InputFormItem } from "../../common/InputFormItem";

export const Parametres: FunctionComponent = () => {

    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();

    const onFinish = (values: any) => {
        const { reinscriptionPrioritaire, anneeScolaire, inscriptionEnabled } = form.getFieldsValue();
        const params: ParamDto[] = [
            { name: ParamName.REINSCRIPTION_ENABLED, value: reinscriptionPrioritaire ? reinscriptionPrioritaire.toString() : "false" },
            { name: ParamName.ANNEE_SCOLAIRE, value: anneeScolaire },
            { name: ParamName.INSCRIPTION_ENABLED, value: inscriptionEnabled ? inscriptionEnabled.toString() : "false" }
        ];
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

    function onInscriptionEnabledChange(checked: boolean): void {
        if (!checked) {
            form.setFieldValue("reinscriptionPrioritaire", false);
        }
    }

    function onReinscriptionChanged(checked: boolean): void {
        if (checked) {
            form.setFieldValue("inscriptionEnabled", true);
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
                <h2>Paramètres de l'application</h2>
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <Divider orientation="left">Paramètres</Divider>
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={8}>
                        <Tooltip color="geekblue" title="Ce paramètre permet de désactiver temporairement toutes les inscriptions. 
                        Ainsi, même si une période est active avec ses tarifs, le système ne renvoit pas de tarif et personne ne peut donc s'incrire">
                            <SwitchFormItem name="inscriptionEnabled" label="Activer/Désactiver les inscriptions" onChange={onInscriptionEnabledChange} />
                        </Tooltip>
                    </Col>
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
                        <Tooltip color="geekblue" title="Cette information apparaît notamment sur les formulaire pdf des inscriptions">
                            <InputFormItem name="anneeScolaire" label="Période scolaire en cours" />
                        </Tooltip>
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Spin>
        </Form >
    </>);
}