import React from "react";
import { Modal, Form, Spin, Tooltip } from "antd";
import { useMediaQuery } from 'react-responsive';
import { InputFormItem } from "../../common/InputFormItem";
import { SelectFormItem } from "../../common/SelectFormItem";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { getRolesOptions } from "../../common/commoninputs";
import { SwitchFormItem } from "../../common/SwitchFormItem";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { useAuth } from "../../../hooks/AuthContext";
import { useUtilisateurManagement } from "./utilisateurs/hooks/useUtilisateurManagement";
import { UtilisateurMobileView } from "./utilisateurs/UtilisateurMobileView";
import { UtilisateurDesktopView } from "./utilisateurs/UtilisateurDesktopView";

const Utilisateurs: React.FC = () => {
    const { roles } = useAuth();
    const [form] = Form.useForm();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const {
        users,
        roles: availableRoles,
        isModalOpen,
        selectedUser,
        currentMobilePage,
        collapseActiveKey,
        isLoading,
        setIsModalOpen,
        setCurrentMobilePage,
        setCollapseActiveKey,
        fetchUsers,
        handleCreateOrModifyUser,
        onCreateUser,
        onEditUser,
        onDeleteUser,
        onResendActivationMail,
    } = useUtilisateurManagement(form);

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
                            <UtilisateurMobileView
                                form={form}
                                users={users}
                                roles={availableRoles}
                                isModalOpen={isModalOpen}
                                selectedUser={selectedUser}
                                currentMobilePage={currentMobilePage}
                                collapseActiveKey={collapseActiveKey}
                                onCreateUser={onCreateUser}
                                onEditUser={onEditUser}
                                onDeleteUser={onDeleteUser}
                                onResendActivationMail={onResendActivationMail}
                                fetchUsers={fetchUsers}
                                setCurrentMobilePage={setCurrentMobilePage}
                                setCollapseActiveKey={setCollapseActiveKey}
                                setIsModalOpen={setIsModalOpen}
                                handleCreateOrModifyUser={handleCreateOrModifyUser}
                            />
                        ) : (
                            <UtilisateurDesktopView
                                form={form}
                                users={users}
                                roles={availableRoles}
                                isModalOpen={isModalOpen}
                                selectedUser={selectedUser}
                                currentMobilePage={currentMobilePage}
                                collapseActiveKey={collapseActiveKey}
                                onCreateUser={onCreateUser}
                                onEditUser={onEditUser}
                                onDeleteUser={onDeleteUser}
                                onResendActivationMail={onResendActivationMail}
                                fetchUsers={fetchUsers}
                                setCurrentMobilePage={setCurrentMobilePage}
                                setCollapseActiveKey={setCollapseActiveKey}
                                setIsModalOpen={setIsModalOpen}
                                handleCreateOrModifyUser={handleCreateOrModifyUser}
                            />
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