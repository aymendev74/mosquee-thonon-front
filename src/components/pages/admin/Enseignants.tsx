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
    const [roles, setRoles] = useState<string[]>([]);
    const { getRoles } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();

    function getUsernameOptions() {
        return usernames.map((username) => ({ label: username, value: username }));
    }

    function getRoleOptions() {
        return roles.map((role) => ({ label: role, value: role }));
    }

    const handleCancel = () => {
        setIsModalEnseignantVisible(false);
        setEditingEnseignantId(null);
        formEnseignant.resetFields();
    };

    const handleAddOrUpdateEnseignant = () => {
        formEnseignant
            .validateFields()
            .then((values) => {
                if (editingEnseignantId) {
                    let enseignant = enseignants.find((enseignant) => enseignant.id === editingEnseignantId);
                    enseignant = { ...enseignant, ...values };
                    setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(EXISTING_ENSEIGNANT_ENDPOINT, { id: editingEnseignantId }), data: enseignant });
                } else {
                    const newEnseignant = { ...values };
                    setApiCallDefinition({ method: "POST", url: ENSEIGNANT_ENDPOINT, data: newEnseignant });
                }
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
            .then((values) => {
                const newUser = {
                    username: values.username,
                    password: values.password,
                    roles: [{ role: values.role }]
                }
                setApiCallDefinition({ method: "POST", url: USER_ENDPOINT, data: newUser });
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

    function onDeleteEnseignant(id: number) {
        setApiCallDefinition({ method: "DELETE", url: buildUrlWithParams(EXISTING_ENSEIGNANT_ENDPOINT, { id }) });
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: USER_ENDPOINT });
    }, []);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${USER_ENDPOINT}`]: (result: any) => {
            setUsernames(result);
            setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT });
        },
        [`GET:${ENSEIGNANT_ENDPOINT}`]: (result: any) => {
            setEnseignants(result);
            resetApi();
        },
        [`POST:${ENSEIGNANT_ENDPOINT}`]: (result: any) => {
            if (result) {
                notification.open({ message: "L'enseignant a bien été créé", type: "success" });
                // On reload les enseignants depuis la base
                setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT });
            }
        },
        [`PUT:${EXISTING_ENSEIGNANT_ENDPOINT}`]: (result: any) => {
            if (result) {
                notification.open({ message: "L'enseignant a bien été mis à jour", type: "success" });
                // On reload les enseignants depuis la base
                setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT });
            }
        },
        [`DELETE:${EXISTING_ENSEIGNANT_ENDPOINT}`]: (result: any) => {
            if (result) {
                notification.open({ message: "L'enseignant a bien été supprimé", type: "success" });
                // On reload les enseignants depuis la base
                setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT });
            }
        },
        [`GET:${ROLES_ENDPOINT}`]: (result: any) => {
            setRoles(result);
            resetApi();
        },
        [`POST:${USER_ENDPOINT}`]: (result: any) => {
            if (result) {
                notification.open({ message: "L'utilisateur a bien été créé", type: "success" });
                // On reload les utilisateurs depuis la base
                setApiCallDefinition({ method: "GET", url: USER_ENDPOINT });
            }
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

    const onNewUtilisateur = () => {
        setIsModalEnseignantVisible(false);
        setIsModalUtilisateurVisible(true);
        setApiCallDefinition({ method: "GET", url: ROLES_ENDPOINT });
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

    return getRoles()?.includes("ROLE_ADMIN") ? (
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