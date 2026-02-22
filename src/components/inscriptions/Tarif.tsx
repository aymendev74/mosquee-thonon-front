import { Alert, Button, Card, Checkbox, Col, FormInstance, Row, Typography } from "antd";
import { FunctionComponent } from "react";
import { EleveFront } from "../../services/eleve";
import { TarifInscriptionDto } from "../../services/tarif";
import { SelectFormItem } from "../common/SelectFormItem";
import { getStatutInscriptionOptions } from "../common/commoninputs";
import { getConsentementInscriptionCoursLibelle } from "../../utils/FormUtils";
import { SwitchFormItem } from "../common/SwitchFormItem";
import { EuroCircleOutlined, SettingOutlined } from "@ant-design/icons";

const { Title } = Typography;

export type TarifProps = {
    eleves: EleveFront[];
    tarifInscription?: TarifInscriptionDto;
    form: FormInstance;
    isAdmin: boolean;
    isReadOnly: boolean;
    onPreviousStep: () => void;
    consentementChecked: boolean;
    setConsentementChecked: React.Dispatch<React.SetStateAction<boolean>>;
    isReinscriptionOnlyEnabled: boolean;
}

export const Tarif: FunctionComponent<TarifProps> = ({ eleves, tarifInscription, form, isAdmin, isReadOnly, onPreviousStep, consentementChecked, setConsentementChecked, isReinscriptionOnlyEnabled }) => {

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
            <Title level={5} style={{ marginBottom: 12 }}>
                <EuroCircleOutlined /> Tarif
            </Title>
            {tarifInscription ? (
                <Card
                    size="small"
                    style={{
                        marginBottom: 20,
                        backgroundColor: "#f6ffed",
                        border: "1px solid #b7eb8f",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                            Tarif annuel pour {eleves.length} élève{eleves.length > 1 ? "s" : ""}
                            {" "}({getStatutAdherent()})
                        </div>
                        <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                            {getMontantTotalInscription()?.toFixed(2)} €
                        </div>
                    </div>
                </Card>
            ) : (
                <Alert
                    type="error"
                    message="Les inscriptions sont actuellement fermées. Aucun tarif n'a pu être calculé."
                    showIcon
                    style={{ marginBottom: 20 }}
                />
            )}
            {!isAdmin && tarifInscription?.listeAttente && !isReinscriptionOnlyEnabled && (
                <Alert message="Liste d'attente" type="warning"
                    description="Attention, le nombre d'élèves inscrits sur la période en cours a atteint la capacité maximum. Vous allez être placés sur liste d'attente si vous validez cette inscription."
                    showIcon style={{ marginBottom: 20 }} />
            )}
            {isAdmin && (
                <>
                    <Title level={5} style={{ marginBottom: 12 }}>
                        <SettingOutlined /> Administration
                    </Title>
                    <Card size="small" style={{ marginBottom: 20 }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <SelectFormItem name="statut" label="Statut inscription" options={getStatutInscriptionOptions()} disabled={isReadOnly} />
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <SwitchFormItem name="sendMailConfirmation" label="Renvoi automatique du mail de confirmation" disabled={isReadOnly} />
                            </Col>
                        </Row>
                    </Card>
                </>
            )}
            {isReinscriptionOnlyEnabled && (
                <Alert message="Attention à l'orthographe !" type="warning"
                    description="Vous êtes en train de réinscrire vos enfants, veuillez vous assurer que l'orthographe des noms et prénoms, ainsi que les dates de naissances sont correctes et identiques à l'inscription de l'année précédente. Dans le cas contraire, l'inscription risque d'être rejetée automatiquement."
                    showIcon style={{ marginBottom: 20 }} />
            )}
            {!isAdmin && tarifInscription && (
                <Card size="small" style={{ marginBottom: 20 }}>
                    <Checkbox checked={consentementChecked} onChange={(e) => { setConsentementChecked(e.target.checked) }}>
                        <span style={{ fontSize: 12 }}>
                            {getConsentementInscriptionCoursLibelle()}
                        </span>
                    </Checkbox>
                </Card>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <Button onClick={onPreviousStep}>Précédent</Button>
                {isAdmin && !isReadOnly && (<Button type="primary" htmlType="submit">Enregistrer</Button>)}
                {!isAdmin && (<Button type="primary" htmlType="submit" disabled={!tarifInscription}>Valider mon inscription</Button>)}
            </div>
        </>);

}