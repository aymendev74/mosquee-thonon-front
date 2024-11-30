import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, CLASSES_ENDPOINT, ENSEIGNANT_ENDPOINT, handleApiCall } from '../../../services/services';
import { BackTop, Button, Card, Col, Divider, FloatButton, Form, notification, Row, Space } from 'antd';
import { InputNumberFormItem } from '../../common/InputNumberFormItem';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { ClasseDtoB, ClasseDtoF } from '../../../services/classe';
import { NiveauInterne, NiveauScolaire } from '../../../services/inscription';
import { ModalClasse } from '../../modals/ModalClasse';
import { EnseignantDto } from '../../../services/enseignant';
import { prepareClasseBeforeForm } from '../../../utils/FormUtils';

const CreateUpdateClasse = () => {
    const { getRoles } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [enseignants, setEnseignants] = useState<EnseignantDto[]>([]);
    const [classes, setClasses] = useState<ClasseDtoF[]>([]);
    const [form] = useForm();
    const [modalClasseOpen, setModalClasseOpen] = useState(false);
    const [debutAnneeScolaire, setDebutAnneeScolaire] = useState<number>(dayjs().year());
    const [classeToEdit, setClasseToEdit] = useState<ClasseDtoF | undefined>();

    function doSearchClasses(values: any) {
        const anneeDebut: number = values.anneeDebut;
        const anneeFin: number = anneeDebut + 1;
        setApiCallDefinition({ method: "GET", url: CLASSES_ENDPOINT, params: { anneeDebut, anneeFin } });
    }

    function onCreateClasse() {
        const debutAnneeScolaire: number = form.getFieldValue("anneeDebut");
        if (!debutAnneeScolaire) {
            notification.warning({ message: "Veuillez sélectionner une année avant de pouvoir créer une classe" });
            return;
        }
        setDebutAnneeScolaire(debutAnneeScolaire);
        setClasseToEdit(undefined);
        setModalClasseOpen(true);
    }

    function onModifierClasse(classe: ClasseDtoF) {
        setClasseToEdit(classe);
        setModalClasseOpen(true);
    }

    const getClasseView = (classe: ClasseDtoF) => {
        const enseignant = enseignants.find(enseignant => enseignant.id === classe.idEnseignant);
        return (
            <Col span={6}>
                <Card size="small" title={classe.libelle} extra={<Button type="primary" icon={<EditOutlined onClick={() => onModifierClasse(classe)} />} />} style={{ width: 350 }}>
                    <p><b>Niveau: </b>{classe.niveau}</p>
                    <p><b>Nombre d'élèves: </b>{classe.liensClasseEleves?.length ?? 0}</p>
                    <p><b>Enseignant: </b>{enseignant?.prenom + " " + enseignant?.nom}</p>
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
        if (!modalClasseOpen) {
            setApiCallDefinition({ method: "GET", url: CLASSES_ENDPOINT, params: { anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 } });
        }
    }, [modalClasseOpen]);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${CLASSES_ENDPOINT}`]: (result: any) => {
            const classesB = result as ClasseDtoB[];
            const classesF = classesB.map(classe => prepareClasseBeforeForm(classe));
            setClasses(classesF);
            setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT });
        },
        [`GET:${ENSEIGNANT_ENDPOINT}`]: (result: any) => {
            setEnseignants(result);
            resetApi();
        }
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
            <FloatButton.BackTop />
            <FloatButton icon={<PlusOutlined />} type="primary" onClick={onCreateClasse} tooltip="Créer une nouvelle classe" />
            <ModalClasse
                open={modalClasseOpen}
                setOpen={setModalClasseOpen}
                enseignants={enseignants}
                debutAnneeScolaire={debutAnneeScolaire}
                finAnneeScolaire={debutAnneeScolaire + 1}
                classeToEdit={classeToEdit}
            />
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="classes-title">
                        {<EditOutlined />} Administration des classes
                    </h2>
                </div>
            </div>
            <div className="main-content-classes">
                <Form form={form}
                    onFinish={doSearchClasses}
                    initialValues={{ anneeDebut: dayjs().year() }}>
                    <Row>
                        <Col span={6}>
                            <InputNumberFormItem
                                name="anneeDebut"
                                label="Année scolaire"
                                rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
                            />
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