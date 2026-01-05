import { useAuth } from '../../../hooks/AuthContext';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Empty, Form, Row, Tooltip } from 'antd';
import { InputNumberFormItem } from '../../common/InputNumberFormItem';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { ClasseDtoF } from '../../../services/classe';
import { ModalClasse } from '../../modals/ModalClasse';
import { ModaleConfirmSuppression } from '../../modals/ModalConfirmSuppression';
import { UnahtorizedAccess } from '../public/UnahtorizedAccess';
import { useClasseManagement } from './classes/hooks/useClasseManagement';

const CreateUpdateClasse = () => {
    const { roles } = useAuth();
    const [form] = useForm();

    const {
        enseignants,
        classes,
        modalClasseOpen,
        debutAnneeScolaire,
        classeToEdit,
        modalDeleteClasseOpen,
        setModalClasseOpen,
        setModalDeleteClasseOpen,
        doSearchClasses,
        onCreateClasse,
        onModifierClasse,
        onDeleteClasse,
        onConfirmDeleteClasse,
        handleAnneeScolaireChanged,
    } = useClasseManagement(form);

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