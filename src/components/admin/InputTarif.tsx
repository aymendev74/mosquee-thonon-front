import { Col, Form, InputNumber, Row, Tag } from "antd"
import { FunctionComponent } from "react"

export type InputTarifProperties = {
    nameMontantBase: string;
    nameMontantEnfant: string;
    labelNbEnfant: string;
}

export const InputTarif: FunctionComponent<InputTarifProperties> = ({ nameMontantBase, nameMontantEnfant, labelNbEnfant }) => {

    return (<>
        <Row gutter={[16, 32]}>
            <Col span={2}>
                <Tag color="blue">{labelNbEnfant}</Tag>
            </Col>
            <Col span={4}>
                <Form.Item name={nameMontantBase} label="Base">
                    <InputNumber addonAfter="€" />
                </Form.Item>
            </Col>
            <Col span={4}>
                <Form.Item name={nameMontantEnfant} label="Par enfant">
                    <InputNumber addonAfter="€" />
                </Form.Item>
            </Col>
        </Row>
    </>
    );

}