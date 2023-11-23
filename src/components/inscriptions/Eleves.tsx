import { Button, Col, Collapse, DatePicker, Divider, Form, FormInstance, Input, Radio, Row } from "antd";
import { FunctionComponent, useState } from "react";
import { SignatureDto, StatutInscription } from "../../services/inscription";
import { Eleve } from "../../services/eleve";

export type EleveProps = {
    isReadOnly: boolean;
    eleves: Eleve[];
    setEleves: React.Dispatch<React.SetStateAction<Eleve[]>>;
    form: FormInstance;
}

type FieldType = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    telephone: string;
    email: string;
    sexe: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    statut: StatutInscription;
    signature: SignatureDto;
};

export const Eleves: FunctionComponent<EleveProps> = ({ isReadOnly, eleves, setEleves, form }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>();

    const { Panel } = Collapse;

    const ElevesList = () => (
        <Collapse accordion>
            {eleves.map((eleve, index) => (
                <Panel header={eleve.prenom} key={index}>
                    <p><strong>Nom:</strong> {eleve.nom}</p>
                    <p><strong>Prénom:</strong> {eleve.prenom}</p>
                    <Button onClick={() => handleEdit(index)}>Modifier</Button>
                    <Button className="m-left-10" onClick={() => handleDelete(index)} danger>Supprimer</Button>
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
        const updatedEleves = [...eleves, { nom, prenom, dateNaissance, niveau }];
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
        <Button className="m-bottom-15" type="primary" onClick={handleAddClick}>Ajouter un élève</Button>

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
                        <Input disabled={isReadOnly} />
                    </Form.Item>
                </Col>
            </Row>
            <div className="centered-content pad-10">
                <Button onClick={() => setEditingIndex(null)}>Annuler</Button>

                <Button className="m-left-10" onClick={ajouterEleve}>Ajouter</Button>

            </div>
        </>)}

        <ElevesList />

    </>);

}