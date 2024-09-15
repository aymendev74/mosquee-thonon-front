import { Col, Row, Tag } from "antd"
import { FunctionComponent } from "react"
import { InputNumberFormItem } from "../common/InputNumberFormItem";

export type InputTarifProperties = {
    nameMontantBase: string;
    nameMontantEnfant: string;
    labelNbEnfant: string;
    readOnly: boolean;
}

export const InputTarif: FunctionComponent<InputTarifProperties> = ({ nameMontantBase, nameMontantEnfant, labelNbEnfant, readOnly }) => {

    return (<>
        <Row gutter={[16, 32]}>
            <Col span={2}>
                <Tag color="blue">{labelNbEnfant}</Tag>
            </Col>
            <Col span={4}>
                <InputNumberFormItem name={nameMontantBase} label="Base" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
            <Col span={4}>
                <InputNumberFormItem name={nameMontantEnfant} label="Par enfant" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
        </Row>
    </>
    );

}