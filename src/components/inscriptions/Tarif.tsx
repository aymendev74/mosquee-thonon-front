import { Col, Divider, FormInstance, Row } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Eleve } from "../../services/eleve";
import useApi from "../../hooks/useApi";
import { INSCRIPTION_TARIFS } from "../../services/services";
import { TarifInscriptionDto } from "../../services/tarif";

export type TarifProps = {
    eleves: Eleve[];
    form: FormInstance;
}

export const Tarif: FunctionComponent<TarifProps> = ({ eleves, form }) => {

    const { result, setApiCallDefinition, resetApi } = useApi();
    const [tarifInscription, setTarifInscription] = useState<TarifInscriptionDto>();

    useEffect(() => {
        const responsableLegal = form.getFieldValue("responsableLegal");
        if (eleves.length > 0) {
            setApiCallDefinition({ method: "POST", url: INSCRIPTION_TARIFS, data: { responsableLegal, eleves } });
        } else {
            setTarifInscription(undefined);
        }
    }, [eleves.length]);

    useEffect(() => {
        if (result) {
            setTarifInscription(result);
            resetApi();
        }
    }, [result]);

    return (<>
        <Row>
            <Col span={24}>
                <Divider orientation="left">Tarifs</Divider>
            </Col>
        </Row>
        <Row>
            <Col span={12}>
                Tarif Base: {tarifInscription?.tarifBase ?? ""}
            </Col>
        </Row>
        <Row>
            <Col span={12}>
                Tarif par enfant: {tarifInscription?.tarifEleve ?? ""}
            </Col>
        </Row>
    </>)
}