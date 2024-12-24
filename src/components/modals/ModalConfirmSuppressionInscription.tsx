import { Button, Modal } from 'antd';
import { FunctionComponent } from 'react';

export type ModaleConfirmSuppressionProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    nbInscriptions: number,
    onConfirm: () => void,
}

export const ModaleConfirmSuppressionInscription: FunctionComponent<ModaleConfirmSuppressionProps> = ({ open, setOpen, nbInscriptions, onConfirm }) => {

    const close = () => setOpen(false);
    return (<Modal title="Suppression inscriptions" open={open} width={400} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onConfirm} danger>Oui</Button></>} onOk={onConfirm}>
        <div>
            Voulez-vous vraiment supprimer les données de(s) {nbInscriptions} inscription(s) sélectionnée(s) ? <br />
        </div>
        <strong>Attention, cette opération est définitive.</strong>
    </Modal>);


}