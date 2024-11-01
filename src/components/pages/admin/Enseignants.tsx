import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, notification, Row, Col } from 'antd';
import { useAuth } from '../../../hooks/AuthContext';
import { EditOutlined } from '@ant-design/icons';
import { EnseignantDto } from '../../../services/enseignant';
import useApi from '../../../hooks/useApi';
import { ApiCallbacks, buildUrlWithParams, ENSEIGNANT_ENDPOINT_POINT, EXISTING_ENSEIGNANT_ENDPOINT_POINT, handleApiCall, USER_ENDPOINT } from '../../../services/services';
import { validatePhoneNumber } from '../../../utils/FormUtils';
import { InputFormItem } from '../../common/InputFormItem';
import { SelectFormItem } from '../../common/SelectFormItem';

const Enseignants = () => {
    const [enseignants, setEnseignants] = useState<EnseignantDto[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingEnseignantId, setEditingEnseignantId] = useState<number | null>(null);
    const [usernames, setUsernames] = useState<string[]>([]);
    const { getLoggedUser } = useAuth();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();

    function getUsernameOptions() {
        return usernames.map((username) => ({ label: username, value: username }));
    }

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingEnseignantId(null);
        form.resetFields();
    };

    const handleAddOrUpdateEnseignant = () => {
        form
            .validateFields()
            .then((values) => {
                if (editingEnseignantId) {
                    let enseignant = enseignants.find((enseignant) => enseignant.id === editingEnseignantId);
                    enseignant = { ...enseignant, ...values };
                    setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(EXISTING_ENSEIGNANT_ENDPOINT_POINT, { id: editingEnseignantId }), data: enseignant });
                } else {
                    const newEnseignant = { ...values };
                    setApiCallDefinition({ method: "POST", url: ENSEIGNANT_ENDPOINT_POINT, data: newEnseignant });
                }
                setIsModalVisible(false);
                form.resetFields();
            })
            .catch((info) => {
                console.log('Erreur lors de la validation :', info);
            });
    };

    function onEditEnseignant(id: number) {
        const enseignant = enseignants.find((enseignant) => enseignant.id === id);
        if (enseignant) {
            form.setFieldsValue(enseignant);
            setEditingEnseignantId(id);
            setIsModalVisible(true);
        }
    }

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: USER_ENDPOINT });
    }, []);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${USER_ENDPOINT}`]: (result: any) => {
            setUsernames(result);
            setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT_POINT });
        },
        [`GET:${ENSEIGNANT_ENDPOINT_POINT}`]: (result: any) => {
            setEnseignants(result);
            resetApi();
        },
        [`POST:${ENSEIGNANT_ENDPOINT_POINT}`]: (result: any) => {
            notification.open({ message: "L'enseignant a bien été créé", type: "success" });
            // On reload les enseignants depuis la base
            setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT_POINT });
        },
        [`PUT:${EXISTING_ENSEIGNANT_ENDPOINT_POINT}`]: (result: any) => {
            notification.open({ message: "L'enseignant a bien été mis à jour", type: "success" });
            // On reload les enseignants depuis la base
            setApiCallDefinition({ method: "GET", url: ENSEIGNANT_ENDPOINT_POINT });
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

    const columns = [
        { title: 'Nom', dataIndex: 'nom', key: 'nom' },
        { title: 'Prénom', dataIndex: 'prenom', key: 'prenom' },
        { title: 'Nom d’utilisateur', dataIndex: 'username', key: 'username' },
        { title: 'Téléphone mobile', dataIndex: 'mobile', key: 'mobile' },
        { title: "", dataIndex: "action", key: "action", render: (value: any, record: EnseignantDto, index: number) => <EditOutlined onClick={() => onEditEnseignant(record.id)} /> }
    ];

    return getLoggedUser() ? (
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
                    <Button type="primary" onClick={() => setIsModalVisible(true)}>
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

                <Modal
                    title="Ajouter un Nouvel Enseignant"
                    open={isModalVisible}
                    onOk={handleAddOrUpdateEnseignant}
                    onCancel={handleCancel}
                    okText="Enregistrer"
                    cancelText="Annuler"
                    width={400}
                >
                    <Form form={form}
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
                            <Col span={22}>
                                <SelectFormItem name="username"
                                    label="Nom d’utilisateur"
                                    rules={[{ required: true, message: 'Veuillez saisir le nom d’utilisateur.' }]}
                                    options={getUsernameOptions()} />
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
            </div>
        </>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>;
};

export default Enseignants;