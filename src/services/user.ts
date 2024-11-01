export type RoleDto = {
    role: string;
}

export type UserDto = {
    username: string;
    password: string;
    roles: RoleDto[];
}