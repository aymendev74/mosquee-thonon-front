import { Button, Modal } from 'antd';
import { FunctionComponent } from 'react';

export type ModaleConfirmSuppressionProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    title: string,
    onConfirm: () => void
}

export const ModaleConfirmSuppression: FunctionComponent<ModaleConfirmSuppressionProps> = ({ open, setOpen, title, onConfirm }) => {

    const close = () => setOpen(false);
    return (<Modal title={title} open={open} width={400} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onConfirm} danger>Oui</Button></>}>
        <div>
            Voulez-vous vraiment supprimer cet élément ? <br />
        </div>
        <strong>Attention, cette opération est définitive.</strong>
    </Modal>);


}