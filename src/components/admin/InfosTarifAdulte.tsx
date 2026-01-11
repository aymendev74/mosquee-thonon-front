import { Col, Divider, Row, Tag } from "antd";
import { FunctionComponent } from "react";
import { useMediaQuery } from 'react-responsive';
import { InputTarif } from "./InputTarifEnfant";
import { InputNumberFormItem } from "../common/InputNumberFormItem";

export type InfosTarifProperties = {
    readOnly: boolean;
}

export const InfosTarifAdulte: FunctionComponent<InfosTarifProperties> = ({ readOnly }) => {
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return (<>
        <Row gutter={[16, 32]}>
            <Col span={24}>
                <Divider orientation="left">Tarifs</Divider>
            </Col>
        </Row>
        <div className="m-bottom-15 fw-bold">Tarif unique</div>
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8}>
                <InputNumberFormItem name="montantEtudiant" label="Etudiant" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
            <Col xs={24} sm={24} md={8}>
                <InputNumberFormItem name="montantSansActivite" label="Sans activité lucrative" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
            <Col xs={24} sm={24} md={8}>
                <InputNumberFormItem name="montantAvecActivite" label="Avec activité lucrative" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
            </Col>
        </Row>
    </>);
}