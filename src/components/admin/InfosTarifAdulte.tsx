import { Col, Divider, Row, Tag } from "antd";
import { FunctionComponent } from "react";
import { InputTarif } from "./InputTarifEnfant";
import { InputNumberFormItem } from "../common/InputNumberFormItem";

export type InfosTarifProperties = {
    readOnly: boolean;
}

export const InfosTarifAdulte: FunctionComponent<InfosTarifProperties> = ({ readOnly }) => {

    return (<>
        <Row gutter={[16, 32]}>
            <Col span={24}>
                <Divider orientation="left">Tarifs</Divider>
            </Col>
        </Row>
        <div className="m-bottom-15 fw-bold">Tarif unique</div>
        <InputNumberFormItem name="montantEtudiant" label="Etudiant" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
        <InputNumberFormItem name="montantSansActivite" label="Sans activité lucrative" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
        <InputNumberFormItem name="montantAvecActivite" label="Avec activité lucrative" addonAfter="€" disabled={readOnly} rules={[{ required: true, message: "Veuillez saisir un montant" }]} />
    </>);
}