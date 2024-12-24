export type RoleDto = {
    role: string;
}

export type UserDto = {
    username: string;
    password: string;
    roles: RoleDto[];
}

export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_ENSEIGNANT = "ROLE_ENSEIGNANT";
