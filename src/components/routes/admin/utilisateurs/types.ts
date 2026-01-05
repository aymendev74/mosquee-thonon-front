import { Dispatch, SetStateAction } from "react";
import { FormInstance } from "antd";
import { UserDto } from "../../../../services/user";

export interface UtilisateurViewProps {
    form: FormInstance;
    users: UserDto[];
    roles: string[];
    isModalOpen: boolean;
    selectedUser: UserDto | null;
    currentMobilePage: number;
    collapseActiveKey: string[];
    onCreateUser: () => void;
    onEditUser: (user: UserDto) => void;
    onDeleteUser: (user: UserDto) => void;
    onResendActivationMail: (user: UserDto) => void;
    fetchUsers: () => void;
    setCurrentMobilePage: (page: number) => void;
    setCollapseActiveKey: Dispatch<SetStateAction<string[]>>;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    handleCreateOrModifyUser: (values: any) => Promise<void>;
}
