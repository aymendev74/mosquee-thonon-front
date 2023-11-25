import { Col, Divider, FormInstance, Row } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Eleve } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";

export type TarifProps = {
    eleves: Eleve[];
    tarifInscription?: TarifInscriptionDto;
    form: FormInstance;
}

export const Tarif: FunctionComponent<TarifProps> = ({ eleves, tarifInscription, form }) => {

    const getStatutAdherent = () => {
        const adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        return adherent ? "adhérent" : "non adhérent"
    }

    return !tarifInscription ? (<div className="m-bottom-15">Pour obtenir un tarif, veuillez ajouter des élèves</div>)
        : (
            <>
                <Divider orientation="left">Tarifs</Divider>
                <div className="m-bottom-10">Votre tarif <strong> {getStatutAdherent()}</strong> pour <strong>{eleves.length} élève(s)</strong></div>
                <div className="m-bottom-10">Tarif Base: {tarifInscription?.tarifBase ?? ""}</div>
                <div className="m-bottom-10">Tarif par enfant: {tarifInscription?.tarifEleve ?? ""}</div>
            </>);

}