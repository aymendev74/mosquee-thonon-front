import { Button, Col, Collapse, FormInstance, Row, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { EleveFront } from "../../services/eleve";
import { getLibelleNiveauScolaire, getNiveauInterneEnfantOptions, getNiveauOptions } from "../common/commoninputs";
import { UserAddOutlined } from "@ant-design/icons";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";
import dayjs, { Dayjs } from "dayjs";

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

    const { Panel } = Collapse;

    const ElevesList = () => (
        <Collapse accordion>
            {eleves.map((eleve, index) => (
                <Panel header={eleve.prenom} key={index}>
                    <p><strong>Nom :</strong> {eleve.nom}</p>
                    <p><strong>Prénom :</strong> {eleve.prenom}</p>
                    <p><strong>Date de naissance :</strong> {dayjs(eleve.dateNaissance).format(APPLICATION_DATE_FORMAT)}</p>
                    <p><strong>Niveau scolaire :</strong> {getLibelleNiveauScolaire(eleve.niveau)}</p>
                    {(isAdmin) && <p><strong>Niveau interne :</strong> {eleve.niveauInterne}</p>}
                    {
                        !isReadOnly &&
                        (<>
                            <Button onClick={() => handleEdit(index)}>Modifier</Button>
                            <Button className="m-left-10" onClick={() => handleDelete(index)} danger>Supprimer</Button>
                        </>)
                    }
                </Panel>
            ))}
        </Collapse>
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
        form.setFieldValue("nomEleve", eleves[index].nom);
        form.setFieldValue("prenomEleve", eleves[index].prenom);
        form.setFieldValue("dateNaissanceEleve", eleves[index].dateNaissance);
        form.setFieldValue("niveauScolaire", eleves[index].niveau);
        form.setFieldValue("niveauInterne", eleves[index].niveauInterne);
    };

    const resetEmptyForm = () => {
        form.setFieldValue("nomEleve", undefined);
        form.setFieldValue("prenomEleve", undefined);
        form.setFieldValue("dateNaissanceEleve", undefined);
        form.setFieldValue("niveauScolaire", undefined);
        form.setFieldValue("niveauInterne", undefined);
        setError(undefined);
    }

    const validateEleve = () => {
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

        return { nom, prenom, dateNaissance, niveau, niveauInterne };
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
        <div className="m-bottom-15">Veuillez renseigner les informations concernant les élèves à inscrire. Vous pouvez modifier les informations à tout moment en sélectionnant l'élève dans la liste ci-dessous et en cliquant sur "Modifier".</div>
        {!isReadOnly && editingIndex == null && (<Button icon={<UserAddOutlined />} className="m-bottom-15" type="primary" onClick={handleAddClick}>Ajouter un élève</Button>)}
        {editingIndex != null && (<>
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
            {error && (<div className="centered-content pad-10 form-errors">
                {error}
            </div>)}
            <div className="centered-content pad-10">
                <Button onClick={() => { setEditingIndex(null); resetEmptyForm(); }}>Annuler</Button>

                <Button className="m-left-10" onClick={ajouterEleve} type="primary">Enregistrer</Button>

            </div>
        </>)}

        <ElevesList />

        <div className="container-nav-bi">
            <Button onClick={onPreviousStep}>Précédent</Button>
            <Button onClick={handleNextStep} type="primary">Suivant</Button>
        </div>
    </>);

}