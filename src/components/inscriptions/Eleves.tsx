import { Button, Col, Collapse, DatePicker, Divider, Form, FormInstance, Input, Radio, Row, Select } from "antd";
import { FunctionComponent, useState } from "react";
import { SignatureDto, StatutInscription } from "../../services/inscription";
import { Eleve } from "../../services/eleve";
import moment from "moment";
import { getLibelleNiveauScolaire, getNiveauOptions } from "../common/commoninputs";

export type EleveProps = {
    isReadOnly: boolean;
    eleves: Eleve[];
    setEleves: React.Dispatch<React.SetStateAction<Eleve[]>>;
    form: FormInstance;
}

export const Eleves: FunctionComponent<EleveProps> = ({ isReadOnly, eleves, setEleves, form }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>();

    const { Panel } = Collapse;

    const ElevesList = () => (
        <Collapse accordion>
            {eleves.map((eleve, index) => (
                <Panel header={eleve.prenom} key={index}>
                    <p><strong>Nom :</strong> {eleve.nom}</p>
                    <p><strong>Prénom :</strong> {eleve.prenom}</p>
                    <p><strong>Date de naissance :</strong> {moment(eleve.dateNaissance).format("DD.MM.YYYY")}</p>
                    <p><strong>Niveau scolaire :</strong> {getLibelleNiveauScolaire(eleve.niveau)}</p>
                    {
                        !isReadOnly &&
                        (<><Button onClick={() => handleEdit(index)}>Modifier</Button>
                            <Button className="m-left-10" onClick={() => handleDelete(index)} danger>Supprimer</Button>
                        </>)
                    }
                </Panel>
            ))}
        </Collapse>
    );

    const handleAddClick = () => {
        setEditingIndex(eleves.length);
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        form.setFieldValue("nomEleve", eleves[index].nom);
        form.setFieldValue("prenomEleve", eleves[index].prenom);
        form.setFieldValue("dateNaissanceEleve", eleves[index].dateNaissance);
        form.setFieldValue("niveauScolaire", eleves[index].niveau);
    };

    const resetEmptyForm = () => {
        form.setFieldValue("nomEleve", undefined);
        form.setFieldValue("prenomEleve", undefined);
        form.setFieldValue("dateNaissanceEleve", undefined);
        form.setFieldValue("niveauScolaire", undefined);
    }

    const ajouterEleve = () => {
        const nom = form.getFieldValue("nomEleve");
        const prenom = form.getFieldValue("prenomEleve");
        const dateNaissance = form.getFieldValue("dateNaissanceEleve");
        const niveau = form.getFieldValue("niveauScolaire");
        let newEleve: Eleve = { nom, prenom, dateNaissance, niveau };
        if (eleves[editingIndex!] && eleves[editingIndex!].signature) {
            newEleve = { ...newEleve, signature: eleves[editingIndex!].signature }
        }
        if (eleves[editingIndex!] && eleves[editingIndex!].idTarif) {
            newEleve = { ...newEleve, idTarif: eleves[editingIndex!].idTarif }
        }
        const updatedEleves = [...eleves, newEleve];
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

    return (<>
        {!isReadOnly && (<Button className="m-bottom-15" type="primary" onClick={handleAddClick}>Ajouter un élève</Button>)}
        {editingIndex != null && (<>
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <Form.Item
                        label="Nom"
                        name="nomEleve"
                        rules={[{ required: true, message: "Veuillez saisir votre nom" }]}
                    >
                        <Input disabled={isReadOnly} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Prénom"
                        name="prenomEleve"
                        rules={[{ required: true, message: "Veuillez saisir votre prénom" }]}
                    >
                        <Input disabled={isReadOnly} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <Form.Item
                        label="Date de naissance"
                        name="dateNaissanceEleve"
                        rules={[{ required: true, message: "Veuillez saisir votre date de naissance" }]}
                    >
                        <DatePicker placeholder="Sélectionnez une date de naissance" disabled={isReadOnly} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Niveau scolaire"
                        name="niveauScolaire"
                        rules={[{ required: true, message: "Veuillez saisir votre niveau scolaire" }]}
                    >
                        <Select disabled={isReadOnly} options={getNiveauOptions()} />
                    </Form.Item>
                </Col>
            </Row>
            <div className="centered-content pad-10">
                <Button onClick={() => setEditingIndex(null)}>Annuler</Button>

                <Button className="m-left-10" onClick={ajouterEleve}>Enregistrer</Button>

            </div>
        </>)}

        <ElevesList />

    </>);

}