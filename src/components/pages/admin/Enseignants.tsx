import { FunctionComponent, useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, notification, Row, Col, Tooltip } from 'antd';
import { useAuth } from '../../../hooks/AuthContext';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { EnseignantDto } from '../../../services/enseignant';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, buildUrlWithParams, ENSEIGNANT_ENDPOINT, EXISTING_ENSEIGNANT_ENDPOINT, handleApiCall, ROLES_ENDPOINT, USER_ENDPOINT } from '../../../services/services';
import { validatePhoneNumber } from '../../../utils/FormUtils';
import { InputFormItem } from '../../common/InputFormItem';
import { SelectFormItem } from '../../common/SelectFormItem';
import { ROLE_ENSEIGNANT } from '../../../services/user';
import { UnahtorizedAccess } from '../UnahtorizedAccess';

type ModalUtilisateurProps = {
    presetRole?: string;
}

const Enseignants = () => {
    const [enseignants, setEnseignants] = useState<EnseignantDto[]>([]);
    const [isModalEnseignantVisible, setIsModalEnseignantVisible] = useState(false);
    const [isModalUtilisateurVisible, setIsModalUtilisateurVisible] = useState(false);
    const [formEnseignant] = Form.useForm();
    const [formUtilisateur] = Form.useForm();
    const [editingEnseignantId, setEditingEnseignantId] = useState<number | null>(null);
    const [usernames, setUsernames] = useState<string[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const { roles } = useAuth();
    const { execute, isLoading } = useApi();

    function getUsernameOptions() {
        return usernames.map((username) => ({ label: username, value: username }));
    }

    function getRoleOptions() {
        return allRoles.map((role) => ({ label: role, value: role }));
    }

    const handleCancel = () => {
        setIsModalEnseignantVisible(false);
        setEditingEnseignantId(null);
        formEnseignant.resetFields();
    };

    async function loadEnseignants() {
        const { successData } = await execute<EnseignantDto[]>({ method: "GET", url: ENSEIGNANT_ENDPOINT });
        if (successData) {
            setEnseignants(successData);
        }
    }

    const handleAddOrUpdateEnseignant = () => {
        formEnseignant
            .validateFields()
            .then(async (values) => {
                if (editingEnseignantId) {
                    let enseignant = enseignants.find((enseignant) => enseignant.id === editingEnseignantId);
                    enseignant = { ...enseignant, ...values };
                    await execute({ method: "PUT", url: buildUrlWithParams(EXISTING_ENSEIGNANT_ENDPOINT, { id: editingEnseignantId }), data: enseignant });
                    notification.open({ message: "L'enseignant a bien été créé", type: "success" });
                } else {
                    const newEnseignant = { ...values };
                    await execute({ method: "POST", url: ENSEIGNANT_ENDPOINT, data: newEnseignant });
                    notification.open({ message: "L'enseignant a bien été mis à jour", type: "success" });
                }
                loadEnseignants();
                setIsModalEnseignantVisible(false);
                formEnseignant.resetFields();
            })
            .catch((info) => {
                console.log('Erreur lors de la validation :', info);
            });
    };

    const handleAddUtilisateur = () => {
        formUtilisateur
            .validateFields()
            .then(async (values) => {
                const newUser = {
                    username: values.username,
                    password: values.password,
                    roles: [{ role: values.role }]
                }
                await execute({ method: "POST", url: USER_ENDPOINT, data: newUser });
                loadUsers();
                setIsModalUtilisateurVisible(false);
                formUtilisateur.resetFields();
            })
            .catch((info) => {
                console.log('Erreur lors de la validation :', info);
            });
    };

    function onEditEnseignant(id: number) {
        const enseignant = enseignants.find((enseignant) => enseignant.id === id);
        if (enseignant) {
            formEnseignant.setFieldsValue(enseignant);
            setEditingEnseignantId(id);
            setIsModalEnseignantVisible(true);
        }
    };

    async function onDeleteEnseignant(id: number) {
        await execute({ method: "DELETE", url: buildUrlWithParams(EXISTING_ENSEIGNANT_ENDPOINT, { id }) });
        loadEnseignants();
    }

    async function loadUsers() {
        const { successData } = await execute<string[]>({ method: "GET", url: USER_ENDPOINT });
        if (successData) {
            setUsernames(successData);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            loadUsers();
            loadEnseignants();
        }
        loadData();
    }, []);

    const columns = [
        { title: 'Nom', dataIndex: 'nom', key: 'nom' },
        { title: 'Prénom', dataIndex: 'prenom', key: 'prenom' },
        { title: 'Nom d’utilisateur', dataIndex: 'username', key: 'username' },
        { title: 'Téléphone mobile', dataIndex: 'mobile', key: 'mobile' },
        {
            title: "", dataIndex: "action", key: "action", render: (value: any, record: EnseignantDto, index: number) => {
                return (<>
                    <EditOutlined onClick={() => onEditEnseignant(record.id)} />
                    {!record.hasClasse && <DeleteOutlined className="m-left-10" onClick={() => onDeleteEnseignant(record.id)} />}
                </>
                )
            }
        }
    ];

    const onNewUtilisateur = async () => {
        setIsModalEnseignantVisible(false);
        setIsModalUtilisateurVisible(true);
        const { successData } = await execute<string[]>({ method: "GET", url: ROLES_ENDPOINT });
        if (successData) {
            setAllRoles(successData);
        }
    }

    const ModalEnseignant = () => (
        <Modal
            title="Enseignant"
            open={isModalEnseignantVisible}
            onOk={handleAddOrUpdateEnseignant}
            onCancel={handleCancel}
            okText="Enregistrer"
            cancelText="Annuler"
            width={400}
        >
            <Form form={formEnseignant}
                layout="vertical"
                className="container-full-width">
                <Row>
                    <Col span={22}>
                        <InputFormItem name="nom"
                            label="Nom de l'enseignant"
                            rules={[{ required: true, message: 'Veuillez saisir le nom.' }]} />
                    </Col>
                </Row>
                <Row>
                    <Col span={22}>
                        <InputFormItem name="prenom"
                            label="Prénom"
                            rules={[{ required: true, message: 'Veuillez saisir le prénom.' }]} />
                    </Col>
                </Row>
                <Row>
                    <Col span={18}>
                        <SelectFormItem name="username"
                            label="Nom d’utilisateur"
                            rules={[{ required: true, message: 'Veuillez saisir le nom d’utilisateur.' }]}
                            options={getUsernameOptions()} />
                    </Col>
                    <Col span={4}>
                        <PlusCircleOutlined onClick={onNewUtilisateur} />
                    </Col>
                </Row>
                <Row>
                    <Col span={22}>
                        <InputFormItem name="mobile"
                            label="Téléphone mobile"
                            rules={[{ validator: validatePhoneNumber }, { required: true, message: 'Veuillez saisir un numéro de mobile' }]} />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );

    const ModalUtilisateur: FunctionComponent<ModalUtilisateurProps> = ({ presetRole }) => (
        <Modal
            title="Nouvel utilisateur"
            open={isModalUtilisateurVisible}
            onOk={handleAddUtilisateur}
            onCancel={() => setIsModalUtilisateurVisible(false)}
            okText="Enregistrer"
            cancelText="Annuler"
            width={400}
        >
            <Form form={formUtilisateur}
                layout="vertical"
                className="container-full-width"
                initialValues={{ role: presetRole }} >
                <Row>
                    <Col span={22}>
                        <InputFormItem name="username"
                            label="Nom d'utilisateur"
                            rules={[{ required: true, message: "Veuillez saisir le nom d'utilisateur." }]} />
                    </Col>
                </Row>
                <Row>
                    <Col span={22}>

                        <Tooltip title="Demander à l'enseignant de remplacer son mot de passe lors de sa première connexion" color="geekblue">
                            <Form.Item
                                label="Mot de passe"
                                name="password"
                                rules={[{ required: true, message: "Veuillez saisir votre nouveau mot de passe" }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Tooltip>
                    </Col>
                </Row>
                <Row>
                    <Col span={22}>
                        <SelectFormItem name="role"
                            label="Rôle"
                            rules={[{ required: true, message: "Veuillez saisir le rôle de l’utilisateur." }]}
                            options={getRoleOptions()}
                            disabled={!!presetRole} />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );

    return roles?.includes("ROLE_ADMIN") ? (
        <>
            <div className="centered-content">
                <div className="container-full-width">
                    <h2 className="enseignant-title">
                        {<EditOutlined />} Administration des enseignants
                    </h2>
                </div>
            </div>
            <div className="main-content-enseignant">
                <Card title="Gestion des enseignants" style={{ marginBottom: '20px' }}>
                    <Button type="primary" onClick={() => setIsModalEnseignantVisible(true)}>
                        Ajouter un Enseignant
                    </Button>
                </Card>

                <Table
                    dataSource={enseignants}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: "Aucun enseignant enregistré" }}
                />

                <ModalEnseignant />
                <ModalUtilisateur presetRole={ROLE_ENSEIGNANT} />
            </div>
        </>
    ) : <UnahtorizedAccess />
};

export default Enseignants;