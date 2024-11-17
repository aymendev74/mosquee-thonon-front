import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { EditOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, handleApiCall } from '../../../services/services';
import { BackTop, Button, Card, Col, Divider, Form, Row, Space } from 'antd';
import { InputNumberFormItem } from '../../common/InputNumberFormItem';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { ClasseDtoF } from '../../../services/classe';
import { NiveauInterne, NiveauScolaire } from '../../../services/inscription';

const CreateUpdateClasse = () => {

    const { getRoles } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [classes, setClasses] = useState<ClasseDtoF[]>([{
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }, {
        id: 0, libelle: "Classe n° 1", niveau: NiveauInterne.N1_2, debutAnneeScolaire: 2024, finAnneeScolaire: 2025,
        idEnseignant: 1, liensClasseEleves: [{
            eleve: {
                id: 0, nom: "Nom", prenom: "Prenom", niveauInterne: NiveauInterne.N1_2,
                dateNaissance: dayjs("2024-01-01"), niveau: NiveauScolaire.CM1
            }
        }], activites: []
    }]);
    const [formSearch] = useForm();
    const [formClasse] = useForm();

    function doSearchClasses(values: any) {
        const anneeDebut: number = values.anneeDebut;
        const anneeFin: number = anneeDebut + 1;
    }

    const getClasseView = (classe: ClasseDtoF) => {
        return (
            <Col span={6}>
                <Card size="small" title={classe.libelle} extra={<Button type="primary" icon={<EditOutlined />} />} style={{ width: 350 }}>
                    <p><b>Niveau: </b>{classe.niveau}</p>
                    <p><b>Nombre d'élèves: </b>{classe.liensClasseEleves?.length ?? 0}</p>
                    <p><b>Enseignant: </b>Aymen MIMECH</p>
                </Card>
            </Col>
        );
    };

    function getClassesContent() {
        return (
            <>
                <Divider orientation="left">Les classes de la période sélectionnée</Divider>
                <Row gutter={[16, 32]}>
                    {classes && classes.map((classe: ClasseDtoF) => getClasseView(classe))}
                </Row>
            </>
        );
    }

    useEffect(() => {

    }, []);

    const apiCallbacks: ApiCallbacks = {

    };

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    return getRoles()?.includes("ROLE_ADMIN") ? (
        <>
            <BackTop />
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="classes-title">
                        {<EditOutlined />} Administration des classes
                    </h2>
                </div>
            </div>
            <div className="main-content-classes">
                <Form form={formSearch}
                    onFinish={doSearchClasses}
                    initialValues={{ anneeDebut: dayjs().year() }}>
                    <Row>
                        <Col span={6}>
                            <InputNumberFormItem name="anneeDebut" label="Année scolaire" rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]} />
                        </Col>
                        <Col span={4}>
                            <Button type="primary" htmlType="submit">Rechercher</Button>
                        </Col>
                    </Row>
                </Form>
                {getClassesContent()}
            </div>
        </>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>;
};

export default CreateUpdateClasse;