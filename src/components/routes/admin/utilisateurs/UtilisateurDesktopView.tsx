import { FunctionComponent } from "react";
import { Button, Card, Space, Table, Tooltip } from "antd";
import { CheckCircleOutlined, CloseCircleTwoTone, DeleteOutlined, EditOutlined, LockFilled, MailOutlined, PlusOutlined } from "@ant-design/icons";
import { UtilisateurViewProps } from "./types";
import { UserDto, RoleDto } from "../../../../services/user";
import { ColumnsType } from "antd/es/table";
import { getRoleLibelle } from "../../../common/commoninputs";
import { AdminSearchFilter } from "../../../common/AdminSearchFilter";
import { getRolesOptions } from "../../../common/commoninputs";

export const UtilisateurDesktopView: FunctionComponent<UtilisateurViewProps> = ({
    users,
    onCreateUser,
    onEditUser,
    onDeleteUser,
    onResendActivationMail,
    fetchUsers,
}) => {
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
            title: 'Actions',
            key: 'actions',
            render: (_: any, user: UserDto) => (
                <Space size="small">
                    <Tooltip title="Modifier">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => onEditUser(user)}
                        />
                    </Tooltip>
                    <Tooltip title="Renvoyer mail d'activation">
                        <Button
                            icon={<MailOutlined />}
                            size="small"
                            disabled={user.enabled || !user.email}
                            onClick={() => onResendActivationMail(user)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDeleteUser(user)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div>
                <AdminSearchFilter
                    doSearch={fetchUsers}
                    inputFilters={[
                        { name: "prenomFilter", libelle: "Prénom", inputType: "InputText" },
                        { name: "nomFilter", libelle: "Nom", inputType: "InputText" },
                        { name: "emailFilter", libelle: "E-mail", inputType: "InputText" },
                        { name: "roleFilter", libelle: "Rôle", inputType: "Select", selectOptions: getRolesOptions() },
                    ]}
                />
            </div>

            {users && users.length > 0 ? (
                <div className="desktop-results">
                    <Card
                        title="Résultats"
                        bordered={false}
                        extra={
                            <Button type="primary" onClick={onCreateUser} icon={<PlusOutlined />}>
                                Nouvel utilisateur
                            </Button>
                        }
                    >
                        <Table<UserDto>
                            dataSource={users}
                            columns={columns}
                            rowKey={(record) => record.username}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </div>
            ) : (
                <div className="no-results">
                    Aucun utilisateur trouvé
                </div>
            )}
        </>
    );
};
