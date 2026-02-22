import { FunctionComponent } from "react";
import { Button, Card, Collapse, Form, Input, Pagination, Select, Tag } from "antd";
import { DeleteOutlined, EditTwoTone, MailOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { UtilisateurViewProps } from "./types";
import { UserDto } from "../../../services/user";
import { getRoleLibelle, getRolesOptions } from "../../../components/common/commoninputs";

export const UtilisateurMobileView: FunctionComponent<UtilisateurViewProps> = ({
    form,
    users,
    currentMobilePage,
    collapseActiveKey,
    onCreateUser,
    onEditUser,
    onDeleteUser,
    onResendActivationMail,
    fetchUsers,
    setCurrentMobilePage,
    setCollapseActiveKey,
}) => {
    const mobilePageSize = 10;

    const MobileUserCard = ({ user }: { user: UserDto }) => {
        return (
            <Card className="adhesion-card-mobile" size="small">
                <div className="adhesion-card-header">
                    <div className="adhesion-card-name">
                        {user.prenom} {user.nom}
                    </div>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Email:</span>
                    <span className="adhesion-card-value">{user.email}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Nom d'utilisateur:</span>
                    <span className="adhesion-card-value">{user.username}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Rôles:</span>
                    <span className="adhesion-card-value">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {user.roles.map((r) => (
                                <Tag key={r.role} color="blue">{getRoleLibelle(r)}</Tag>
                            ))}
                        </div>
                    </span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Activation:</span>
                    <span className="adhesion-card-value">
                        {user.enabled ? (
                            <Tag color="success">Activé</Tag>
                        ) : (
                            <Tag color="error">Non activé</Tag>
                        )}
                    </span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Verrouillage:</span>
                    <span className="adhesion-card-value">
                        {user.locked ? (
                            <Tag color="error">Verrouillé</Tag>
                        ) : (
                            <Tag color="success">Déverrouillé</Tag>
                        )}
                    </span>
                </div>
                <div className="adhesion-card-actions">
                    <Button size="small" onClick={() => onEditUser(user)}>
                        <EditTwoTone /> Modifier
                    </Button>
                    <Button size="small" onClick={() => onResendActivationMail(user)} disabled={user.enabled || !user.email}>
                        <MailOutlined /> Mail d'activation
                    </Button>
                    <Button size="small" danger onClick={() => onDeleteUser(user)}>
                        <DeleteOutlined /> Supprimer
                    </Button>
                </div>
            </Card>
        );
    };

    const SearchFiltersNoCard = () => {
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
                    <Button icon={<SearchOutlined />} onClick={fetchUsers} style={{ marginRight: "10px" }} type="primary">
                        Rechercher
                    </Button>
                </div>
            </div>
        );
    };

    const filterCollapseItems: any[] = [
        {
            key: '1',
            label: <span><SearchOutlined /> Filtres de recherche</span>,
            children: <SearchFiltersNoCard />
        }
    ];

    return (
        <>
            <Collapse
                activeKey={collapseActiveKey}
                onChange={(keys) => setCollapseActiveKey(keys as string[])}
                items={filterCollapseItems}
                className="mobile-filters-collapse"
            />

            {users && users.length > 0 ? (
                <div className="mobile-results">
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
                </div>
            ) : (
                <div className="no-results">
                    Aucun utilisateur trouvé
                </div>
            )}
        </>
    );
};
