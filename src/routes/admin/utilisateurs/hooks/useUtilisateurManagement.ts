import { useState, useEffect } from "react";
import { FormInstance, notification } from "antd";
import useApi, { APICallResult } from "../../../../hooks/useApi";
import { UserDto } from "../../../../services/user";
import { buildUrlWithParams, ROLES_ENDPOINT, USER_ENDPOINT, USER_EXISITING_ENDPOINT, USER_RESEND_ACTIVATION_MAIL_ENDPOINT } from "../../../../services/services";

export const useUtilisateurManagement = (form: FormInstance) => {
    const { execute, isLoading } = useApi();
    const [users, setUsers] = useState<UserDto[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([]);
    const [currentMobilePage, setCurrentMobilePage] = useState(1);
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);

    const fetchRoles = async () => {
        const resultRoles = await execute<string[]>({
            method: "GET",
            url: ROLES_ENDPOINT,
        });
        if (resultRoles.successData) {
            setRoles(resultRoles.successData);
        }
    };

    const fetchUsers = async () => {
        const { nomFilter, prenomFilter, emailFilter, roleFilter } = form.getFieldsValue();
        const searchCriteria = {
            nom: nomFilter ?? null,
            prenom: prenomFilter ?? null,
            email: emailFilter ?? null,
            role: roleFilter ?? null,
        };
        const result = await execute<UserDto[]>({ method: "GET", url: USER_ENDPOINT, params: searchCriteria });
        if (result.successData) {
            setUsers(result.successData);
            setCollapseActiveKey([]);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleCreateOrModifyUser = async (values: any) => {
        const roles = values.roles ?? [];
        const user = { ...values, roles: roles.map((r: string) => ({ role: r })) };
        delete user.rolesDisplay;
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
            const messageConfirmation = selectedUser
                ? "L'utilisateur a bien été modifié"
                : "L'utilisateur a bien été créé. Un mail d'activation va être envoyé à l'adresse e-mail indiquée.";
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
        setIsModalOpen(true);
    };

    const onEditUser = (user: UserDto) => {
        setSelectedUser(user);
        form.setFieldsValue(user);
        form.setFieldValue("roles", user.roles.map((r) => r.role));
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
    };

    return {
        users,
        roles,
        isModalOpen,
        selectedUser,
        selectedUsers,
        currentMobilePage,
        collapseActiveKey,
        isLoading,
        setIsModalOpen,
        setSelectedUser,
        setSelectedUsers,
        setCurrentMobilePage,
        setCollapseActiveKey,
        fetchUsers,
        handleCreateOrModifyUser,
        onCreateUser,
        onEditUser,
        onDeleteUser,
        onDeleteSelectedUsers,
        onResendActivationMail,
    };
};
