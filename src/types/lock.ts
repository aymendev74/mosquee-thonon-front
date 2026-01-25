export enum ResourceType {
    ADHESION = "ADHESION",
    INSCRIPTION = "INSCRIPTION",
    FEUILLE_PRESENCE = "FEUILLE_PRESENCE",
    BULLETIN = "BULLETIN"
}

export type LockRequestDto = {
    resourceType: ResourceType;
    resourceId: number;
}

export type LockResultDto = {
    acquired: boolean;
    expiresAt: string;
    username: string;
}

export type LockConflictError = {
    acquired: false;
    expiresAt: string;
    username: string;
}
