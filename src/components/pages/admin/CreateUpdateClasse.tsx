import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, buildUrlWithParams, CLASSES_ENDPOINT, ENSEIGNANT_ENDPOINT, EXISTING_CLASSES_ENDPOINT, handleApiCall, USER_ENDPOINT } from '../../../services/services';
import { Button, Card, Col, Divider, Empty, FloatButton, Form, notification, Row, Tooltip } from 'antd';
import { InputNumberFormItem } from '../../common/InputNumberFormItem';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { ClasseDtoB, ClasseDtoF } from '../../../services/classe';
import { ModalClasse } from '../../modals/ModalClasse';
import { prepareClasseBeforeForm } from '../../../utils/FormUtils';
import { ModaleConfirmSuppression } from '../../modals/ModalConfirmSuppression';
import { UnahtorizedAccess } from '../UnahtorizedAccess';
import { valueType } from 'antd/es/statistic/utils';
import { UserDto } from '../../../services/user';

const CreateUpdateClasse = () => {
    const { roles } = useAuth();
    const { execute, isLoading } = useApi();
    const [enseignants, setEnseignants] = useState<UserDto[]>([]);
    const [classes, setClasses] = useState<ClasseDtoF[]>([]);
    const [form] = useForm();
    const [modalClasseOpen, setModalClasseOpen] = useState(false);
    const [debutAnneeScolaire, setDebutAnneeScolaire] = useState<number>(dayjs().year());
    const [classeToEdit, setClasseToEdit] = useState<ClasseDtoF | undefined>();
    const [modalDeleteClasseOpen, setModalDeleteClasseOpen] = useState(false);
    const [classeToDelete, setClasseToDelete] = useState<number | undefined>();

    async function doSearchClasses(values: any) {
        const params = { anneeDebut: values.anneeDebut, anneeFin: values.anneeFin ?? values.anneeDebut + 1 };
        const resultClasses = await execute<ClasseDtoB[]>({ method: "GET", url: CLASSES_ENDPOINT, params });
        if (resultClasses.success && resultClasses.successData) {
            const classesF = resultClasses.successData.map(classe => prepareClasseBeforeForm(classe));
            setClasses(classesF);
        }

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

    function onDeleteClasse(classe: ClasseDtoF) {
        setClasseToDelete(classe.id);
        setModalDeleteClasseOpen(true);
    }

    async function onConfirmDeleteClasse() {
        await execute({ method: "DELETE", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id: classeToDelete }) });
        doSearchClasses({ anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 });
        setModalDeleteClasseOpen(false);
    }

    function getActionsClasseButtons(classe: ClasseDtoF) {
        return (
            <>
                <Tooltip title="Modifier la classe" color="geekblue">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => onModifierClasse(classe)} />
                </Tooltip>
                <Tooltip title="Supprimer la classe" color="geekblue">
                    <Button type="primary" icon={<DeleteOutlined />} className="m-left-10" onClick={() => onDeleteClasse(classe)} danger />
                </Tooltip>
            </>
        );
    }

    const getClasseView = (classe: ClasseDtoF) => {
        const enseignant = enseignants.find(enseignant => enseignant.id === classe.idUtilisateur);
        return (
            <Col span={6}>
                <Card className="card-focus-effect" size="small" title={classe.libelle} extra={getActionsClasseButtons(classe)} >
                    <p><b>Niveau: </b>{classe.niveau}</p>
                    <p><b>Nombre d'élèves: </b>{classe.liensClasseEleves?.length ?? 0}</p>
                    <p><b>Enseignant: </b>{enseignant ? enseignant.prenom + " " + enseignant.nom : "-"}</p>
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
                    {classes.length === 0 && <Empty description="Aucune classe pour l'année sélectionnée" style={{ marginTop: 20 }}></Empty>}
                </Row>
            </>
        );
    }

    useEffect(() => {
        const loadData = async () => {
            if (!modalClasseOpen) {
                doSearchClasses({ anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 });
                const resultEnseignants = await execute<UserDto[]>({ method: "GET", url: USER_ENDPOINT, params: { role: "ROLE_ENSEIGNANT" } });
                if (resultEnseignants.success && resultEnseignants.successData) {
                    setEnseignants(resultEnseignants.successData);
                }
            }
        }
        loadData();
    }, [modalClasseOpen]);

    function handleAnneeScolaireChanged(val: valueType | null) {
        if (!val) return;
        const anneeDebut = typeof val === "string" ? parseFloat(val) : val;
        if (!isNaN(anneeDebut)) { // Vérifie si c'est bien un nombre
            setDebutAnneeScolaire(anneeDebut);
        }
    };

    return roles?.includes("ROLE_ADMIN") ? (
        <>
            <ModalClasse
                open={modalClasseOpen}
                setOpen={setModalClasseOpen}
                enseignants={enseignants}
                debutAnneeScolaire={debutAnneeScolaire}
                finAnneeScolaire={debutAnneeScolaire + 1}
                classeToEdit={classeToEdit}
            />
            <ModaleConfirmSuppression open={modalDeleteClasseOpen} setOpen={setModalDeleteClasseOpen} title="Supprimer une classe" onConfirm={onConfirmDeleteClasse} />
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
                    <Row gutter={[16, 32]}>
                        <Col span={4}>
                            <InputNumberFormItem
                                name="anneeDebut"
                                label="Année scolaire"
                                rules={[{ required: true, message: "Veuillez saisir une année scolaire" }]}
                                onChange={handleAnneeScolaireChanged}
                            />
                        </Col>
                        <Col span={1}>
                            <Tooltip title="Rechercher les classes" color="geekblue"><Button type="primary" htmlType="submit" icon={<SearchOutlined />} /></Tooltip>
                        </Col>
                        <Col span={1}>
                            <Button type="primary" icon={<PlusCircleOutlined />} onClick={onCreateClasse}>Nouvelle classe</Button>
                        </Col>
                    </Row>
                </Form>
                {getClassesContent()}
            </div>
        </>
    ) : <UnahtorizedAccess />
};

export default CreateUpdateClasse;