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
    Dropdown,
    MenuProps,
    Collapse,
    Pagination,
    Checkbox,
    Input,
    Select,
} from "antd";
import { useMediaQuery } from 'react-responsive';
import useApi, { APICallResult } from "../../../hooks/useApi";
import { buildUrlWithParams, ROLES_ENDPOINT, USER_ENDPOINT, USER_EXISITING_ENDPOINT, USER_RESEND_ACTIVATION_MAIL_ENDPOINT } from "../../../services/services";
import { InputFormItem } from "../../common/InputFormItem";
import { SelectFormItem } from "../../common/SelectFormItem";
import { RoleDto, UserDto } from "../../../services/user";
import { CheckCircleOutlined, CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, DeleteTwoTone, DownOutlined, EditOutlined, EditTwoTone, EyeTwoTone, LockFilled, LockOutlined, LockTwoTone, MailFilled, MailOutlined, PlusCircleOutlined, PlusOutlined, SearchOutlined, UnlockOutlined, UnlockTwoTone, UsergroupAddOutlined } from "@ant-design/icons";
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
    const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([]);
    const [form] = Form.useForm();
    const { execute, isLoading } = useApi();
    const [currentMobilePage, setCurrentMobilePage] = useState(1);
    const mobilePageSize = 10;
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const CREER_MENU_KEY = "3";
    const RENVOYER_MAIL_MENU_KEY = "4";
    const SUPPRIMER_MENU_KEY = "5";

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
            setCollapseActiveKey([]);
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
            setSelectedUsers([]);
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
            setSelectedUsers([]);
            fetchUsers();
        }
    };

    const onDeleteSelectedUsers = async () => {
        for (const user of selectedUsers) {
            await execute<UserDto>({
                method: "DELETE",
                url: buildUrlWithParams(USER_EXISITING_ENDPOINT, { id: user.id }),
            });
        }
        notification.open({ message: `${selectedUsers.length} utilisateur(s) supprimé(s)`, type: "success" });
        setSelectedUsers([]);
        fetchUsers();
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

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedUsers.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) {
                if (e.key === MODIFIER_MENU_KEY) {
                    onEditUser(selectedUsers[0]);
                }
            } else if (e.key === CREER_MENU_KEY) {
                onCreateUser();
            } else if (e.key === RENVOYER_MAIL_MENU_KEY && selectedUsers.length === 1) {
                onResendActivationMail(selectedUsers[0]);
            } else if (e.key === SUPPRIMER_MENU_KEY) {
                onDeleteSelectedUsers();
            }
        };

        const desktopActions: MenuProps['items'] = [
            { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedUsers.length !== 1 }
        ];
        const commonActions: MenuProps['items'] = [
            { label: <><PlusOutlined className="action-icon" />Créer un utilisateur</>, key: CREER_MENU_KEY },
            { label: <><MailOutlined className="action-icon" />Renvoyer mail activation</>, key: RENVOYER_MAIL_MENU_KEY, disabled: selectedUsers.length !== 1 || (selectedUsers.length === 1 && (selectedUsers[0].enabled || !selectedUsers[0].email)) },
            { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedUsers.length < 1 }
        ];
        const items: MenuProps['items'] = isMobile ? [...commonActions] : [...desktopActions, ...commonActions];

        const menu: MenuProps = { items, onClick: handleMenuClick } as MenuProps;

        return (
            <Dropdown menu={menu}>
                <Button>
                    Actions <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

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

    const SearchFiltersNoCard = () => {
        const mobileFilterNames = ['prenomFilter', 'nomFilter', 'emailFilter', 'roleFilter'];
        const filters = [
            { name: "prenomFilter", libelle: "Prénom" },
            { name: "nomFilter", libelle: "Nom" },
            { name: "emailFilter", libelle: "E-mail" },
            { name: "roleFilter", libelle: "Rôle", selectOptions: getRolesOptions() },
        ];

        return (
            <div>
                {filters.map(filter => {
                    let inputElement;
                    
                    if ('selectOptions' in filter) {
                        inputElement = <Select placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
                    } else {
                        inputElement = <Input placeholder={filter.libelle} onPressEnter={fetchUsers} />;
                    }

                    return (
                        <Form.Item key={filter.name} name={filter.name} label={filter.libelle}>
                            {inputElement}
                        </Form.Item>
                    );
                })}
                <div className="centered-content">
                    <Button icon={<SearchOutlined />} onClick={fetchUsers} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
                </div>
            </div>
        );
    };

    const MobileUserCard = ({ user }: { user: UserDto }) => {
        const isSelected = selectedUsers.some(u => u.id === user.id);
        
        const handleCardClick = () => {
            if (isSelected) {
                setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
            } else {
                setSelectedUsers([...selectedUsers, user]);
            }
        };

        return (
            <Card className="adhesion-card-mobile" size="small">
                <div className="adhesion-card-header">
                    <div className="adhesion-card-name">
                        {user.prenom} {user.nom}
                    </div>
                    <Checkbox checked={isSelected} onChange={handleCardClick} />
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Email:</span>
                    <span className="adhesion-card-value">{user.email}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Username:</span>
                    <span className="adhesion-card-value">{user.username}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Rôle:</span>
                    <span className="adhesion-card-value">{user.roles.map((r) => getRoleLibelle(r)).join(", ")}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Activé:</span>
                    <span className="adhesion-card-value">
                        {user.enabled ? (
                            <CheckCircleTwoTone twoToneColor="green" />
                        ) : (
                            <CloseCircleTwoTone twoToneColor="red" />
                        )}
                    </span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Verrouillé:</span>
                    <span className="adhesion-card-value">
                        {user.locked ? (
                            <LockTwoTone twoToneColor="red" />
                        ) : (
                            <UnlockTwoTone twoToneColor="green" />
                        )}
                    </span>
                </div>
                <div className="adhesion-card-actions">
                    <Button size="small" onClick={() => onEditUser(user)}>
                        <EditTwoTone /> Modifier
                    </Button>
                    {(
                        <Button size="small" onClick={() => onResendActivationMail(user)} disabled={user.enabled || !user.email}>
                            <MailOutlined /> Mail d'activation
                        </Button>
                    )}
                </div>
            </Card>
        );
    };

    const filterCollapseItems: any[] = [
        {
            key: '1',
            label: <span><SearchOutlined /> Filtres de recherche</span>,
            children: <SearchFiltersNoCard />
        }
    ];

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: UserDto[]) => {
            setSelectedUsers(selectedRows);
        }
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
                        {isMobile ? (
                            <Collapse 
                                activeKey={collapseActiveKey}
                                onChange={(keys) => setCollapseActiveKey(keys as string[])}
                                items={filterCollapseItems} 
                                className="mobile-filters-collapse"                                 
                            />
                        ) : (
                            <div className="desktop-filters">
                                <SearchFilters />
                            </div>
                        )}
                        
                        {users && users.length > 0 ? (
                            <div className={isMobile ? "mobile-results" : "desktop-results"}>
                                {isMobile ? (
                                    <>
                                        <div className="mobile-results-header">
                                            <h3>Résultats</h3>
                                        </div>
                                        <div className="centered-content" style={{ marginBottom: "16px" }}>
                                            <Button type="primary" onClick={onCreateUser} icon={<PlusOutlined />}>
                                                Nouvel utilisateur
                                            </Button>
                                        </div>
                                        <div className="adhesion-cards-mobile">
                                            {users
                                                .slice((currentMobilePage - 1) * mobilePageSize, currentMobilePage * mobilePageSize)
                                                .map(user => (
                                                    <MobileUserCard key={user.id} user={user} />
                                                ))}
                                            <div className="mobile-pagination">
                                                <Pagination
                                                    current={currentMobilePage}
                                                    pageSize={mobilePageSize}
                                                    total={users.length}
                                                    onChange={(page) => setCurrentMobilePage(page)}
                                                    showSizeChanger={false}
                                                    showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} utilisateurs`}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Card title="Résultats" bordered={false}>
                                        <div className="menu-action-container">
                                            <div className="label">Veuillez choisir une action à effectuer :</div>
                                            <div className="bt-action">
                                                <DropdownMenu />
                                            </div>
                                        </div>

                                        <Row>
                                            <Col span={24}>
                                                <Table<UserDto>
                                                    rowSelection={{ type: "checkbox", selectedRowKeys: selectedUsers.map(user => user.id), ...rowSelection }}
                                                    dataSource={users}
                                                    columns={columns}
                                                    rowKey={(record) => record.username}
                                                    loading={isLoading}
                                                    pagination={{ pageSize: 10 }}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <div className="no-results">
                                Aucun utilisateur trouvé
                            </div>
                        )}
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