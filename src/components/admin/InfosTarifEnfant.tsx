import { Col, Divider, Row, Tag } from "antd";
import { FunctionComponent } from "react";
import { InputTarif } from "./InputTarifEnfant";

export type InfosTarifProperties = {
    readOnly: boolean;
}

export const InfosTarifEnfant: FunctionComponent<InfosTarifProperties> = ({ readOnly }) => {

    return (<>
        <Row gutter={[16, 32]}>
            <Col span={24}>
                <Divider orientation="left">Tarifs</Divider>
            </Col>
        </Row>

        <div className="m-bottom-15 fw-bold">Adhérents</div>
        <InputTarif labelNbEnfant="1 enfant" nameMontantBase="montantBase1EnfantAdherent" nameMontantEnfant="montantEnfant1EnfantAdherent" readOnly={readOnly} />
        <InputTarif labelNbEnfant="2 enfants" nameMontantBase="montantBase2EnfantAdherent" nameMontantEnfant="montantEnfant2EnfantAdherent" readOnly={readOnly} />
        <InputTarif labelNbEnfant="3 enfants" nameMontantBase="montantBase3EnfantAdherent" nameMontantEnfant="montantEnfant3EnfantAdherent" readOnly={readOnly} />
        <InputTarif labelNbEnfant="4 enfants et +" nameMontantBase="montantBase4EnfantAdherent" nameMontantEnfant="montantEnfant4EnfantAdherent" readOnly={readOnly} />


        <div className="m-top-15 m-bottom-15 fw-bold">Non Adhérents</div>
        <InputTarif labelNbEnfant="1 enfant" nameMontantBase="montantBase1Enfant" nameMontantEnfant="montantEnfant1Enfant" readOnly={readOnly} />
        <InputTarif labelNbEnfant="2 enfants" nameMontantBase="montantBase2Enfant" nameMontantEnfant="montantEnfant2Enfant" readOnly={readOnly} />
        <InputTarif labelNbEnfant="3 enfants" nameMontantBase="montantBase3Enfant" nameMontantEnfant="montantEnfant3Enfant" readOnly={readOnly} />
        <InputTarif labelNbEnfant="4 enfants et +" nameMontantBase="montantBase4Enfant" nameMontantEnfant="montantEnfant4Enfant" readOnly={readOnly} />

    </>);
}