import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Space,
    Card,
    Typography,
    message,
    Tooltip,
    Spin,
    Row,
    Col,
    notification,
} from "antd";
import useApi, { APICallResult } from "../../../hooks/useApi";
import { buildUrlWithParams, ROLES_ENDPOINT, USER_ENDPOINT, USER_EXISITING_ENDPOINT, USER_RESEND_ACTIVATION_MAIL_ENDPOINT } from "../../../services/services";
import { InputFormItem } from "../../common/InputFormItem";
import { SelectFormItem } from "../../common/SelectFormItem";
import { RoleDto, UserDto } from "../../../services/user";
import { CheckCircleOutlined, CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, EditOutlined, LockFilled, LockOutlined, LockTwoTone, MailFilled, PlusCircleOutlined, UnlockOutlined, UnlockTwoTone, UsergroupAddOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { getRoleLibelle, getRolesOptions } from "../../common/commoninputs";
import { SwitchFormItem } from "../../common/SwitchFormItem";
import { UnahtorizedAccess } from "../UnahtorizedAccess";
import { AdminSearchFilter } from "../../common/AdminSearchFilter";

const Utilisateurs: React.FC = () => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [form] = Form.useForm();
    const { execute, isLoading } = useApi();

    const fetchRoles = async () => {
        const resultRoles = await execute<string[]>({
            method: "GET",
            url: ROLES_ENDPOINT,
        });
        if (resultRoles.successData) {
            setRoles(resultRoles.successData);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        const { nomFilter, prenomFilter, emailFilter, roleFilter } = form.getFieldsValue();
        const searchCriteria = {
            nom: nomFilter ?? null, prenom: prenomFilter ?? null, email: emailFilter ?? null, role: roleFilter ?? null,
        }
        const result = await execute<UserDto[]>({ method: "GET", url: USER_ENDPOINT, params: searchCriteria });
        if (result.successData) {
            setUsers(result.successData);
        }
    }

    const handleCreateOrModifyUser = async (values: any) => {
        const user = { ...values, roles: [{ role: values.role }] };
        let result: APICallResult<UserDto>;
        if (selectedUser) {
            result = await execute<UserDto>({
                method: "PUT",
                url: buildUrlWithParams(USER_EXISITING_ENDPOINT, { id: selectedUser.id }),
                data: user,
            });
        } else {
            result = await execute<UserDto>({
                method: "POST",
                url: USER_ENDPOINT,
                data: user,
            });
        }
        if (result && result.success) {
            const messageConfirmation = selectedUser ? "L'utilisateur a bien été modifié" : "L'utilisateur a bien été créé. Un mail d'activation va être envoyé à l'adresse e-mail indiquée.";
            notification.open({ message: messageConfirmation, type: "success" });
            setIsModalOpen(false);
            form.resetFields();
            fetchUsers();
        }
    };

    const onCreateUser = () => {
        form.resetFields();
        setSelectedUser(null);
        setIsModalOpen(true)
    };

    const onEditUser = (user: UserDto) => {
        setSelectedUser(user);
        form.setFieldsValue(user);
        // Pour l'instant un seul rôle possible pour un utilisateur
        form.setFieldValue("role", user.roles[0].role);
        setIsModalOpen(true);
    };

    const onDeleteUser = async (user: UserDto) => {
        const { success } = await execute<UserDto>({
            method: "DELETE",
            url: buildUrlWithParams(USER_EXISITING_ENDPOINT, { id: user.id }),
        });
        if (success) {
            notification.open({ message: "L'utilisateur a bien été supprimé", type: "success" });
            fetchUsers();
        }
    };

    const onResendActivationMail = async (user: UserDto) => {
        const { success } = await execute<void>({
            method: "POST",
            url: buildUrlWithParams(USER_RESEND_ACTIVATION_MAIL_ENDPOINT, { id: user.id }),
        });
        if (success) {
            notification.open({ message: "Le mail d'activation a bien été renvoyé", type: "success" });
        }
    }

    const columns: ColumnsType<UserDto> = [
        { title: "Nom", dataIndex: "nom", key: "nom" },
        { title: "Prénom", dataIndex: "prenom", key: "prenom" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Nom utilisateur", dataIndex: "username", key: "username" },
        { title: "Mobile", dataIndex: "mobile", key: "mobile" },
        {
            title: "Rôles",
            dataIndex: "roles",
            key: "roles",
            render: (roles: RoleDto[]) => roles.map((r) => getRoleLibelle(r)).join(", "),
        },
        {
            title: 'Activé',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => (
                <span style={{ color: enabled ? 'green' : 'red' }}>
                    {enabled ? (
                        <CheckCircleOutlined />
                    ) : (
                        <CloseCircleTwoTone twoToneColor="red" />
                    )}
                </span>
            ),
        },
        {
            title: 'Verrouillé',
            dataIndex: 'locked',
            key: 'locked',
            render: (locked: boolean) => (
                <span style={{ color: locked ? 'red' : 'green' }}>
                    {locked ? (
                        <LockFilled />
                    ) : (
                        <CheckCircleOutlined />
                    )}
                </span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (value, record, index) => (
                <Space size="middle">
                    <Tooltip title={`Modifier le compte de ${record.prenom} ${record.nom}`} color="geekblue">
                        <Button icon={<EditOutlined />} type="primary" onClick={() => onEditUser(record)} />
                    </Tooltip>
                    <Tooltip title={`Renvoyer un mail d'activation pour le compte de ${record.prenom} ${record.nom}`} color="geekblue">
                        <Button icon={<MailFilled />} type="primary" onClick={() => onResendActivationMail(record)} disabled={record.enabled || !record.email} />
                    </Tooltip>
                    <Tooltip title={`Supprimer le compte de ${record.prenom} ${record.nom}`} color="geekblue">
                        <Button icon={<DeleteOutlined />} type="primary" onClick={() => onDeleteUser(record)} danger />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const SearchFilters = () => {
        return (
            <AdminSearchFilter doSearch={fetchUsers} inputFilters={[
                { name: "prenomFilter", libelle: "Prénom", inputType: "InputText" },
                { name: "nomFilter", libelle: "Nom", inputType: "InputText" },
                { name: "emailFilter", libelle: "E-mail", inputType: "InputText" },
                { name: "roleFilter", libelle: "Rôle", inputType: "Select", selectOptions: getRolesOptions() },
            ]} />
        );
    };

    return roles?.includes("ROLE_ADMIN") ? (
        <div className="centered-content">
            <Form
                name="adminAdhesion"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                autoComplete="off"
                className="container-full-width"
                form={form}
            >
                <h2 className="adhesion-title">
                    <UsergroupAddOutlined /> Administration des utilisateurs
                </h2>
                <Spin spinning={isLoading}>
                    <div className="search-result-container">
                        <div>
                            <SearchFilters />
                        </div>
                        <Card title="Résultats" bordered={false}>
                            <Row>
                                <Col span={5}>
                                    <Button type="primary" onClick={onCreateUser} icon={<PlusCircleOutlined />} className="m-bottom-10" >
                                        Nouvel utilisateur
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Table<UserDto> dataSource={users} columns={columns} rowKey={(record) => record.username}
                                        loading={isLoading} pagination={{ pageSize: 10 }} />
                                </Col>
                            </Row>
                        </Card>
                    </div>
                    <Modal
                        title="Créer/Modifier un utilisateur"
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        onOk={() => form.submit()}
                        okText="Valider"
                        cancelText="Annuler"
                        destroyOnClose
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreateOrModifyUser}
                        >
                            <InputFormItem
                                name="nom"
                                label="Nom"
                                rules={[
                                    { required: true, message: "Veuillez saisir le nom" },
                                ]}
                            />
                            <InputFormItem
                                name="prenom"
                                label="Prénom"
                                rules={[
                                    {
                                        required: true,
                                        message: "Veuillez saisir le prénom",
                                    },
                                ]}
                            />
                            <Tooltip title="Un mail sera envoyé à l'utilisateur afin de définir son mot de passe et d'activer son compte" color="geekblue">
                                <InputFormItem
                                    name="email"
                                    label="Email"
                                    rules={[
                                        {
                                            required: true,
                                            type: "email",
                                            message:
                                                "Veuillez saisir une adresse e-mail valide",
                                        },
                                    ]}
                                />
                            </Tooltip>
                            <InputFormItem name="mobile" label="Mobile" />
                            <Tooltip title="Le nom d'utilisateur sera utilisé pour se connecter" color="geekblue">
                                <InputFormItem
                                    name="username"
                                    label="Nom d'utilisateur"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Veuillez saisir le nom d'utilisateur",
                                        },
                                        {
                                            pattern: /^[a-z0-9._-]{4,20}$/,
                                            message:
                                                "Le nom d'utilisateur doit comporter entre 4 et 20 caractères et ne contenir que des lettres minuscules, chiffres, points, tirets",
                                        },
                                    ]}
                                    disabled={selectedUser !== null}
                                />
                            </Tooltip>
                            <SelectFormItem
                                name="role"
                                label="Rôle"
                                placeholder="Choisissez le rôle"
                                options={getRolesOptions()}
                                allowClear
                                rules={[
                                    {
                                        required: true,
                                        message: "Veuillez sélectionner un rôle",
                                    },
                                ]}
                                disabled={selectedUser !== null}
                            />
                            <SwitchFormItem name="locked" label="Verrouillé" />
                        </Form>
                    </Modal>
                </Spin>
            </Form>
        </div>
    ) : <UnahtorizedAccess />
};

export default Utilisateurs;