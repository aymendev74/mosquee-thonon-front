import { Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { LockStatus } from '../../hooks/useLock';

interface LockAlertProps {
    lockStatus: LockStatus;
    resourceName?: string;
    style?: React.CSSProperties;
}

export const LockAlert: React.FC<LockAlertProps> = ({
    lockStatus,
    resourceName = "Cette ressource",
    style
}) => {
    if (lockStatus.status !== 'conflict') {
        return null;
    }

    return (
        <Alert
            message="Ressource verrouillée"
            description={`${resourceName} est actuellement en cours de modification par ${lockStatus.username} jusqu'à ${new Date(lockStatus.expiresAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`}
            type="warning"
            icon={<LockOutlined />}
            showIcon
            closable
            style={{ marginBottom: 16, ...style }}
        />
    );
};
