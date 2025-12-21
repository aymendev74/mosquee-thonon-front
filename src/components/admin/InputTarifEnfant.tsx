import { Col, Row, Tag } from "antd"
import { FunctionComponent } from "react"
import { useMediaQuery } from 'react-responsive';
import { InputNumberFormItem } from "../common/InputNumberFormItem";

export type InputTarifProperties = {
    nameMontantBase: string;
    nameMontantEnfant: string;
    labelNbEnfant: string;
    readOnly: boolean;
}

export const InputTarif: FunctionComponent<InputTarifProperties> = ({ nameMontantBase, nameMontantEnfant, labelNbEnfant, readOnly }) => {
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={24} md={2} style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: isMobile ? '8px' : '0' }}>
                <Tag color="blue">{labelNbEnfant}</Tag>
            </Col>
            <Col xs={24} sm={12} md={4}>
                <InputNumberFormItem name={nameMontantBase} label="Base" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
            <Col xs={24} sm={12} md={4}>
                <InputNumberFormItem name={nameMontantEnfant} label="Par enfant" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
        </Row>
    );

}