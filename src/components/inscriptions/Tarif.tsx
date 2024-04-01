import { Button, Col, Divider, Form, FormInstance, Radio, Row } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Eleve } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";
import { StatutInscription } from "../../services/inscription";
import { RadioGroupFormItem } from "../common/RadioGroupFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { getStatutInscriptionOptions } from "../common/commoninputs";

export type TarifProps = {
    eleves: Eleve[];
    tarifInscription?: TarifInscriptionDto;
    form: FormInstance;
    isAdmin: boolean;
    isReadOnly: boolean;
    onPreviousStep: React.MouseEventHandler<HTMLElement>;
}

export const Tarif: FunctionComponent<TarifProps> = ({ eleves, tarifInscription, form, isAdmin, isReadOnly, onPreviousStep }) => {

    const getStatutAdherent = () => {
        const adherent = form.getFieldValue(["responsableLegal", "adherent"]);
        return adherent ? "adhérent" : "non adhérent"
    }

    const getMontantTotalInscription = () => {
        if (tarifInscription) {
            return tarifInscription?.tarifBase + (tarifInscription?.tarifEleve * eleves.length);
        }
    }

    return !tarifInscription && !isAdmin ? (<div className="m-bottom-15">Pour obtenir un tarif, veuillez ajouter des élèves</div>)
        : (
            <>
                <Divider orientation="left">Tarifs</Divider>
                <div className="m-bottom-10">Votre tarif <strong> {getStatutAdherent()}</strong> pour <strong>{eleves.length} élève(s)</strong></div>
                <div className="m-bottom-10">Tarif Base: {tarifInscription?.tarifBase ?? ""} euros</div>
                <div className="m-bottom-10">Tarif par enfant: {tarifInscription?.tarifEleve ?? ""} euros</div>
                <div className="m-bottom-10 fw-bold">Total: {getMontantTotalInscription()} euros</div>
                {!isAdmin && tarifInscription?.listeAttente && (<div className="m-bottom-10"><strong>Attention, le nombre d'élèves inscrits sur la période en cours a atteint
                    la capacité maximum. Vous allez être placés sur liste d'attente si vous validez cette inscription.</strong></div>)}
                {isAdmin && (<><Divider orientation="left">Statut</Divider>
                    <Row gutter={[16, 32]}>
                        <Col span={12}>
                            <SelectFormItem name="statut" label="Statut inscription" options={getStatutInscriptionOptions()} disabled={isReadOnly} />
                        </Col>
                    </Row>
                </>)}
                <div className="container-nav-bi">
                    <Button onClick={onPreviousStep}>Précédent</Button>
                    {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                    {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon inscription</Button>)}
                </div>
            </>);

}