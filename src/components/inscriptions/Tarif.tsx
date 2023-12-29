import { Button, Col, Divider, Form, FormInstance, Row } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Eleve } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";

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

    return !tarifInscription && !isAdmin ? (<div className="m-bottom-15">Pour obtenir un tarif, veuillez ajouter des élèves</div>)
        : (
            <>
                <Divider orientation="left">Tarifs</Divider>
                <div className="m-bottom-10">Votre tarif <strong> {getStatutAdherent()}</strong> pour <strong>{eleves.length} élève(s)</strong></div>
                <div className="m-bottom-10">Tarif Base: {tarifInscription?.tarifBase ?? ""}</div>
                <div className="m-bottom-10">Tarif par enfant: {tarifInscription?.tarifEleve ?? ""}</div>
                {!isAdmin && tarifInscription?.listeAttente && (<div className="m-bottom-10"><strong>Attention, le nombre d'élèves inscrits sur la période en cours a atteint
                    la capacité maximum. Vous allez être placés sur liste d'attente si vous validez cette inscription.</strong></div>)}
                <div className="container-nav-bi">
                    <Button onClick={onPreviousStep}>Précédent</Button>
                    {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                    {!isAdmin && (<Button type="primary" htmlType="submit">Valider mon inscription</Button>)}
                </div>
            </>);

}