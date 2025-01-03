import { Button, Checkbox, Col, Divider, FormInstance, Row } from "antd";
import { FunctionComponent } from "react";
import { Eleve, EleveFront } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";
import { SelectFormItem } from "../common/SelectFormItem";
import { getStatutInscriptionOptions } from "../common/commoninputs";
import { getConsentementInscriptionCoursLibelle } from "../../utils/FormUtils";
import { SwitchFormItem } from "../common/SwitchFormItem";

export type TarifProps = {
    eleves: EleveFront[];
    tarifInscription?: TarifInscriptionDto;
    form: FormInstance;
    isAdmin: boolean;
    isReadOnly: boolean;
    onPreviousStep: () => void;
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

    return (
        <>
            <Divider orientation="left">Tarifs</Divider>
            {tarifInscription && (
                <>
                    <div className="m-bottom-10">Votre tarif annuel : <strong>{getMontantTotalInscription()} euros.</strong></div>
                    <div className="m-bottom-10">Ce tarif a été calculé en prenant en compte votre statut (<strong>{getStatutAdherent()}</strong>) et le nombre d'élèves à inscrire.</div>
                </>
            )}
            {!isAdmin && tarifInscription?.listeAttente && (<div className="m-bottom-10"><strong>Attention, le nombre d'élèves inscrits sur la période en cours a atteint
                la capacité maximum. Vous allez être placés sur liste d'attente si vous validez cette inscription.</strong></div>)}
            {isAdmin && (<><Divider orientation="left">Statut</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <SelectFormItem name="statut" label="Statut inscription" options={getStatutInscriptionOptions()} disabled={isReadOnly} />
                    </Col>
                </Row>
            </>)}
            {isAdmin && (<><Divider orientation="left">Renvoi du mail de confirmation</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <SwitchFormItem name="sendMailConfirmation" label="Renvoi automatique du mail de confirmation" disabled={isReadOnly} />
                    </Col>
                </Row>
            </>)}
            {!isAdmin && tarifInscription && (
                <Row gutter={[16, 32]}>
                    <Col span={24}>
                        <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                            {getConsentementInscriptionCoursLibelle()}
                        </Checkbox>
                    </Col>
                </Row>
            )
            }
            {!tarifInscription && (<div>
                Les inscriptions sont actuellement fermés. Aucun tarif n'a pu être calculé
            </div>)
            }
            < div className="container-nav-bi">
                <Button style={{ marginTop: 30 }} onClick={onPreviousStep}>Précédent</Button>
                {isAdmin && !isReadOnly && (<Button style={{ marginTop: 30 }} type="primary" htmlType="submit">Enregistrer</Button>)}
                {!isAdmin && (<Button style={{ marginTop: 30 }} type="primary" htmlType="submit" disabled={!tarifInscription}>Valider mon inscription</Button>)}
            </div >
        </>);

}