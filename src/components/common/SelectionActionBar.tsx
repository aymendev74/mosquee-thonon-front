import { FunctionComponent, ReactNode } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

interface SelectionActionBarProps {
    selectedCount: number;
    itemLabel?: string; // "inscription", "adhésion", etc.
    onValidate?: () => void;
    onDelete?: () => void;
    onCancel: () => void;
    additionalActions?: ReactNode;
    mobile?: boolean;
}

export const SelectionActionBar: FunctionComponent<SelectionActionBarProps> = ({
    selectedCount,
    itemLabel = "élément",
    onValidate,
    onDelete,
    onCancel,
    additionalActions,
    mobile = false,
}) => {
    if (selectedCount === 0) return null;

    const className = mobile ? "selection-action-bar-mobile" : "selection-action-bar";

    return (
        <div className={className}>
            <span className="selection-count">
                <CheckCircleOutlined style={{ marginRight: mobile ? '4px' : '8px' }} />
                <strong>{selectedCount}</strong> {itemLabel}(s) sélectionnée(s)
            </span>
            <Space size={mobile ? "small" : "middle"}>
                {onValidate && (
                    <Button
                        type="primary"
                        ghost
                        icon={<CheckOutlined />}
                        onClick={onValidate}
                        className="selection-action-btn"
                        title="Valider tout"
                    >
                        {!mobile && "Valider tout"}
                    </Button>
                )}
                {onDelete && (
                    <Button
                        danger
                        ghost
                        icon={<DeleteOutlined />}
                        onClick={onDelete}
                        className="selection-action-btn"
                        title="Supprimer tout"
                    >
                        {!mobile && "Supprimer tout"}
                    </Button>
                )}
                {additionalActions}
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={onCancel}
                    className="selection-cancel-btn"
                    title="Annuler"
                >
                    {!mobile && "Annuler"}
                </Button>
            </Space>
        </div>
    );
};
