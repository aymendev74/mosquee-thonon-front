import { FunctionComponent } from "react";
import { Button, Card, Space, Table, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, MailOutlined, PlusOutlined } from "@ant-design/icons";
import { UtilisateurViewProps } from "./types";
import { UserDto, RoleDto } from "../../../services/user";
import { ColumnsType } from "antd/es/table";
import { getRoleLibelle } from "../../../components/common/commoninputs";
import { AdminSearchFilter } from "../../../components/common/AdminSearchFilter";
import { getRolesOptions } from "../../../components/common/commoninputs";

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
            render: (roles: RoleDto[]) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {roles.map((r) => (
                        <Tag key={r.role} color="blue">{getRoleLibelle(r)}</Tag>
                    ))}
                </div>
            ),
        },
        {
            title: 'Activation',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean) => (
                enabled ? (
                    <Tag color="success">Activé</Tag>
                ) : (
                    <Tag color="error">Non activé</Tag>
                )
            ),
        },
        {
            title: 'Verrouillage',
            dataIndex: 'locked',
            key: 'locked',
            render: (locked: boolean) => (
                locked ? (
                    <Tag color="error">Verrouillé</Tag>
                ) : (
                    <Tag color="success">Déverrouillé</Tag>
                )
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
                            type="primary"
                        />
                    </Tooltip>
                    <Tooltip title="Renvoyer mail d'activation">
                        <Button
                            icon={<MailOutlined />}
                            size="small"
                            type="primary"
                            disabled={user.enabled || !user.email}
                            onClick={() => onResendActivationMail(user)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            type="primary"
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
