import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/AuthContext';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, buildUrlWithParams, CLASSES_ENDPOINT, ENSEIGNANT_ENDPOINT, EXISTING_CLASSES_ENDPOINT, handleApiCall } from '../../../services/services';
import { Button, Card, Col, Divider, Empty, FloatButton, Form, notification, Row, Tooltip } from 'antd';
import { InputNumberFormItem } from '../../common/InputNumberFormItem';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { ClasseDtoB, ClasseDtoF } from '../../../services/classe';
import { ModalClasse } from '../../modals/ModalClasse';
import { EnseignantDto } from '../../../services/enseignant';
import { prepareClasseBeforeForm } from '../../../utils/FormUtils';
import { ModaleConfirmSuppression } from '../../modals/ModalConfirmSuppression';
import { UnahtorizedAccess } from '../UnahtorizedAccess';

const CreateUpdateClasse = () => {
    const { getRoles } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [enseignants, setEnseignants] = useState<EnseignantDto[]>([]);
    const [classes, setClasses] = useState<ClasseDtoF[]>([]);
    const [form] = useForm();
    const [modalClasseOpen, setModalClasseOpen] = useState(false);
    const [debutAnneeScolaire, setDebutAnneeScolaire] = useState<number>(dayjs().year());
    const [classeToEdit, setClasseToEdit] = useState<ClasseDtoF | undefined>();
    const [modalDeleteClasseOpen, setModalDeleteClasseOpen] = useState(false);
    const [classeToDelete, setClasseToDelete] = useState<number | undefined>();

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

    function onDeleteClasse(classe: ClasseDtoF) {
        setClasseToDelete(classe.id);
        setModalDeleteClasseOpen(true);
    }

    function onConfirmDeleteClasse() {
        setApiCallDefinition({ method: "DELETE", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id: classeToDelete }) });
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
        const enseignant = enseignants.find(enseignant => enseignant.id === classe.idEnseignant);
        return (
            <Col span={6}>
                <Card size="small" title={classe.libelle} extra={getActionsClasseButtons(classe)} style={{ width: 350 }}>
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
        },
        [`DELETE:${EXISTING_CLASSES_ENDPOINT}`]: (result: any) => {
            setApiCallDefinition({ method: "GET", url: CLASSES_ENDPOINT, params: { anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 } });
            setModalDeleteClasseOpen(false);
        },
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
                            />
                        </Col>
                        <Col span={1}>
                            <Tooltip title="Rechercher les classes" color="geekblue"><Button type="primary" htmlType="submit" icon={<SearchOutlined />} /></Tooltip>
                        </Col>
                    </Row>
                </Form>
                {getClassesContent()}
            </div>
        </>
    ) : <UnahtorizedAccess />
};

export default CreateUpdateClasse;