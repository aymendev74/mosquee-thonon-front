import { Alert, Button, Card, Col, FormInstance, Row, Tag, Typography, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { EleveFront } from "../../services/eleve";
import { getLibelleNiveauScolaire, getNiveauInterneEnfantOptions, getNiveauOptions } from "../common/commoninputs";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";
import dayjs, { Dayjs } from "dayjs";

const { Title } = Typography;

export type EleveProps = {
    isReadOnly: boolean;
    isAdmin: boolean;
    eleves: EleveFront[];
    setEleves: React.Dispatch<React.SetStateAction<EleveFront[]>>;
    form: FormInstance;
    onPreviousStep: () => void;
    onNextStep: () => void;
}

export const Eleves: FunctionComponent<EleveProps> = ({ isReadOnly, isAdmin, eleves, setEleves, form, onPreviousStep, onNextStep }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>();
    const [error, setError] = useState<string>();

    const ElevesList = () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {eleves.map((eleve, index) => (
                <Card
                    key={index}
                    size="small"
                    style={{
                        border: editingIndex === index ? "2px solid #1890ff" : "1px solid #d9d9d9",
                        backgroundColor: editingIndex === index ? "#f0f7ff" : "#fafafa",
                        transition: "all 0.2s ease",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "bold", fontSize: 15 }}>
                                {eleve.prenom} {eleve.nom}
                            </div>
                            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                                Né(e) le {dayjs(eleve.dateNaissance).format(APPLICATION_DATE_FORMAT)}
                                {" · "}
                                {getLibelleNiveauScolaire(eleve.niveau)}
                                {isAdmin && eleve.niveauInterne && (
                                    <> {" · "} Niveau interne : {eleve.niveauInterne}</>
                                )}
                            </div>
                            {eleve.classeId && (
                                <Tag color="orange" style={{ marginTop: 4 }}>Affecté à une classe</Tag>
                            )}
                        </div>
                        {!isReadOnly && (
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(index)}>Modifier</Button>
                                <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(index)} disabled={!!eleve.classeId}>Supprimer</Button>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );

    const handleAddClick = () => {
        setEditingIndex(eleves.length);
        const nomRespLegal = form.getFieldValue(["responsableLegal", "nom"]);
        // par défaut si nom responsable légal renseigné, on renseigne le nom de l'élève avec cette valeur
        if (nomRespLegal) {
            form.setFieldValue("nomEleve", nomRespLegal);
        }
    };

    const handleEdit = (index: number) => {
        setError(undefined);
        setEditingIndex(index);
        form.setFieldValue("idEleve", eleves[index].id);
        form.setFieldValue("nomEleve", eleves[index].nom);
        form.setFieldValue("prenomEleve", eleves[index].prenom);
        form.setFieldValue("dateNaissanceEleve", eleves[index].dateNaissance);
        form.setFieldValue("niveauScolaire", eleves[index].niveau);
        form.setFieldValue("niveauInterne", eleves[index].niveauInterne);
    };

    const resetEmptyForm = () => {
        form.setFieldValue("idEleve", undefined);
        form.setFieldValue("nomEleve", undefined);
        form.setFieldValue("prenomEleve", undefined);
        form.setFieldValue("dateNaissanceEleve", undefined);
        form.setFieldValue("niveauScolaire", undefined);
        form.setFieldValue("niveauInterne", undefined);
        setError(undefined);
    }

    const validateEleve = () => {
        const id = form.getFieldValue("idEleve");
        const nom = form.getFieldValue("nomEleve");
        const prenom = form.getFieldValue("prenomEleve");
        const dateNaissance: Dayjs = form.getFieldValue("dateNaissanceEleve");
        const niveau = form.getFieldValue("niveauScolaire");
        const niveauInterne = form.getFieldValue("niveauInterne");
        if (!nom || !prenom || !dateNaissance || !niveau) {
            if (!niveau) {
                setError("Veuillez saisir le niveau scolaire de l'élève");
            }
            if (!dateNaissance) {
                setError("Veuillez saisir la date de naissance de l'élève");
            }
            if (!prenom) {
                setError("Veuillez saisir le prénom de l'élève");
            }
            if (!nom) {
                setError("Veuillez saisir le nom de l'élève");
            }
            return undefined;
        }

        const premierOctobreAnneCouranteMoins6Ans = dayjs().set("month", 9).set("date", 1).add(-6, "year");
        if (premierOctobreAnneCouranteMoins6Ans.isBefore(dateNaissance)) {
            setError("Les élèves doivent être agés de 6 ans au minimum au 1er octobre");
            return undefined;
        }

        return { id, nom, prenom, dateNaissance, niveau, niveauInterne };
    }

    const ajouterEleve = () => {
        let newEleve: EleveFront | undefined = validateEleve();
        if (!newEleve) {
            return;
        }
        let updatedEleves = [...eleves];
        if (updatedEleves[editingIndex!]) { // Si l'élève existe déjà, on le supprime pour le rajouter
            updatedEleves.splice(editingIndex!, 1);
        }
        updatedEleves = [...updatedEleves, newEleve];
        setEleves(updatedEleves);
        setEditingIndex(null);
        resetEmptyForm();
    };

    const handleDelete = (index: number) => {
        const updatedEleves = [...eleves];
        updatedEleves.splice(index, 1);
        setEleves(updatedEleves);
        setEditingIndex(null);
    };

    const handleNextStep = () => {
        if (eleves.length > 0) {
            onNextStep();
        } else {
            notification.open({ message: "Veuillez ajouter des élèves avant d'aller à l'étape suivante", type: "warning" });
        }
    }

    useEffect(() => {
        if (!isReadOnly) {
            setEditingIndex(0);
        }
    }, []);

    return (<>
        <div style={{ marginBottom: 12, color: "#666", fontSize: 13 }}>
            Veuillez renseigner les informations concernant les élèves à inscrire. Vous pouvez modifier les informations à tout moment en cliquant sur "Modifier".
        </div>
        {!isReadOnly && editingIndex == null && (
            <Button icon={<UserAddOutlined />} style={{ marginBottom: 16 }} type="primary" onClick={handleAddClick}>Ajouter un élève</Button>
        )}
        {editingIndex != null && (
            <Card size="small" style={{ marginBottom: 16, border: "2px solid #1890ff", backgroundColor: "#f0f7ff" }}>
                <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
                    {editingIndex < eleves.length ? "Modifier un élève" : "Ajouter un élève"}
                </Title>
                <InputFormItem type="hidden" name="idEleve" hidden />
                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <InputFormItem name="nomEleve" label="Nom" />
                    </Col>
                    <Col xs={24} md={12}>
                        <InputFormItem label="Prénom" name="prenomEleve" />
                    </Col>
                </Row>
                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <DatePickerFormItem label="Date de naissance" name="dateNaissanceEleve" placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                    </Col>
                    {isAdmin ? (<Col xs={24} md={12}>
                        <SelectFormItem label="Niveau (interne)" name="niveauInterne" disabled={isReadOnly} options={getNiveauInterneEnfantOptions()} />
                    </Col>) : (<Col xs={24} md={12}>
                        <SelectFormItem label="Niveau scolaire" name="niveauScolaire" disabled={isReadOnly} options={getNiveauOptions()} />
                    </Col>)}
                </Row>
                {isAdmin && (<Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <SelectFormItem label="Niveau scolaire" name="niveauScolaire" disabled={isReadOnly} options={getNiveauOptions()} />
                    </Col>
                </Row>)}
                {error && (
                    <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button onClick={() => { setEditingIndex(null); resetEmptyForm(); }}>Annuler</Button>
                    <Button onClick={ajouterEleve} type="primary">Enregistrer</Button>
                </div>
            </Card>
        )}

        <ElevesList />

        <div className="container-nav-bi">
            <Button onClick={onPreviousStep}>Précédent</Button>
            <Button onClick={handleNextStep} type="primary">Suivant</Button>
        </div>
    </>);

}