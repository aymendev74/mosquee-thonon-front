import { Button, Checkbox, Col, Divider, FormInstance, Row } from "antd";
import { FunctionComponent } from "react";
import { Eleve } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";
import { SelectFormItem } from "../common/SelectFormItem";
import { getStatutInscriptionOptions } from "../common/commoninputs";
import { getConsentementInscriptionCoursLibelle } from "../../utils/FormUtils";

export type TarifProps = {
    eleves: Eleve[];
    tarifInscription?: TarifInscriptionDto;
    form: FormInstance;
    isAdmin: boolean;
    isReadOnly: boolean;
    onPreviousStep: React.MouseEventHandler<HTMLElement>;
    consentementChecked: boolean;
    setConsentementChecked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Tarif: FunctionComponent<TarifProps> = ({ eleves, tarifInscription, form, isAdmin, isReadOnly, onPreviousStep, consentementChecked, setConsentementChecked }) => {

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
                <div className="m-bottom-10">Votre tarif annuel : <strong>{getMontantTotalInscription()} euros.</strong></div>
                <div className="m-bottom-10">Ce tarif a été calculé en prenant en compte votre statut (adhérent ou non) et le nombre d'élèves à inscrire.</div>
                {!isAdmin && tarifInscription?.listeAttente && (<div className="m-bottom-10"><strong>Attention, le nombre d'élèves inscrits sur la période en cours a atteint
                    la capacité maximum. Vous allez être placés sur liste d'attente si vous validez cette inscription.</strong></div>)}
                {isAdmin && (<><Divider orientation="left">Statut</Divider>
                    <Row gutter={[16, 32]}>
                        <Col span={12}>
                            <SelectFormItem name="statut" label="Statut inscription" options={getStatutInscriptionOptions()} disabled={isReadOnly} />
                        </Col>
                    </Row>
                </>)}
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        {!isAdmin && (
                            <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                                {getConsentementInscriptionCoursLibelle()}
                            </Checkbox>
                        )}
                    </Col>
                </Row>
                <div className="container-nav-bi">
                    <Button style={{ marginTop: 30 }} onClick={onPreviousStep}>Précédent</Button>
                    {isAdmin && !isReadOnly && (<Button style={{ marginTop: 30 }} type="primary" htmlType="submit">Enregistrer</Button>)}
                    {!isAdmin && (<Button style={{ marginTop: 30 }} type="primary" htmlType="submit">Valider mon inscription</Button>)}
                </div>
            </>);

}