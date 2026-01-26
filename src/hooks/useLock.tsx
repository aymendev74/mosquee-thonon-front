import { useEffect, useRef, useState } from 'react';
import { notification } from 'antd';
import useApi from './useApi';
import { lockService } from '../services/lockService';
import { LockRequestDto, LockResultDto, ResourceType } from '../types/lock';

export type LockStatus =
    | { status: 'idle' }
    | { status: 'acquiring' }
    | { status: 'acquired'; expiresAt: string; username: string }
    | { status: 'conflict'; expiresAt: string; username: string }
    | { status: 'error' };

export const useLock = (resourceType: ResourceType, resourceId: number | null) => {
    const { execute, isLoading } = useApi();
    const [lockStatus, setLockStatus] = useState<LockStatus>({ status: 'idle' });
    const lockRequestRef = useRef<LockRequestDto | null>(null);

    const acquireLock = async () => {
        if (!resourceId) {
            notification.error({ message: 'ID de ressource invalide' });
            return false;
        }

        const lockRequest: LockRequestDto = {
            resourceType,
            resourceId
        };

        lockRequestRef.current = lockRequest;
        setLockStatus({ status: 'acquiring' });

        const result = await execute<LockResultDto>(lockService.acquireLock(lockRequest));

        if (result.success && result.successData) {
            if (result.successData.acquired) {
                setLockStatus({
                    status: 'acquired',
                    expiresAt: result.successData.expiresAt,
                    username: result.successData.username
                });
                return true;
            }
        } else if (result.errorData) {
            const conflictData = result.errorData as LockResultDto;
            if (!conflictData.acquired) {
                setLockStatus({
                    status: 'conflict',
                    expiresAt: conflictData.expiresAt,
                    username: conflictData.username
                });
                return false;
            }
        } else {
            setLockStatus({ status: 'error' });
            notification.error({ message: 'Erreur lors de l\'acquisition du verrou' });
            return false;
        }

        return false;
    };

    const releaseLock = async () => {
        if (!lockRequestRef.current) {
            return;
        }

        const lockRequest = lockRequestRef.current;
        await execute(lockService.releaseLock(lockRequest));
        lockRequestRef.current = null;
        setLockStatus({ status: 'idle' });
    };

    const updateLockStatus = (newStatus: LockStatus) => {
        setLockStatus(newStatus);
        if (newStatus.status === 'conflict' || newStatus.status === 'error' || newStatus.status === 'idle') {
            lockRequestRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (lockRequestRef.current) {
                execute(lockService.releaseLock(lockRequestRef.current));
            }
        };
    }, []);

    return {
        lockStatus,
        acquireLock,
        releaseLock,
        updateLockStatus,
        isLoading,
        isLocked: lockStatus.status === 'acquired'
    };
};
