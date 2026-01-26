import { LockRequestDto, LockResultDto } from "../types/lock";

export const lockService = {
    acquireLock: (lockRequest: LockRequestDto) => ({
        url: '/locks',
        method: 'POST' as const,
        data: lockRequest
    }),

    releaseLock: (lockRequest: LockRequestDto) => ({
        url: '/locks',
        method: 'DELETE' as const,
        data: lockRequest
    })
};
