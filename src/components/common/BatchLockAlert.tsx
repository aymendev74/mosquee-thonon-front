import { Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface BatchLockAlertProps {
    show: boolean;
    resourceType: string;
    username?: string;
    expiresAt?: string;
    style?: React.CSSProperties;
}

export const BatchLockAlert: React.FC<BatchLockAlertProps> = ({
    show,
    resourceType,
    username,
    expiresAt,
    style
}) => {
    if (!show) {
        return null;
    }

    const description = username && expiresAt
        ? `Une des ${resourceType}s sélectionnées est actuellement en cours de modification par ${username} jusqu'à ${new Date(expiresAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`
        : `Une des ${resourceType}s sélectionnées est actuellement verrouillée par un autre utilisateur.`;

    return (
        <Alert
            message="Conflit de verrouillage"
            description={description}
            type="warning"
            icon={<LockOutlined />}
            showIcon
            closable
            style={{ marginBottom: 16, ...style }}
        />
    );
};
