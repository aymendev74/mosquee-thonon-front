import { z } from "zod";

export type RoleDto = {
    role: string;
}

export type UserDto = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    enabled: boolean;
    locked: boolean
    mobile: string;
    username: string;
    password: string;
    roles: RoleDto[];
}

export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_ENSEIGNANT = "ROLE_ENSEIGNANT";
export const ROLE_TRESORIER = "ROLE_TRESORIER";

export const AccountInfosSchema = z.object({
    username: z.string(),
    enabled: z.boolean(),
});
export type AccountInfos = z.infer<typeof AccountInfosSchema>;
