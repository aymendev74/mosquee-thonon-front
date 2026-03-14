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
            <p>Vous êtes sur le point de supprimer <strong>{nbInscriptions} inscription(s)</strong> sélectionnée(s).</p>
            <p>Cette action entraînera la <strong>suppression définitive</strong> de :</p>
            <ul>
                <li>Toutes les données liées à ces inscriptions</li>
                <li>Les élèves rattachés à ces inscriptions</li>
                <li>Les bulletins associés</li>
            </ul>
            <p><strong>Cette action est irréversible.</strong></p>
        </div>
    </Modal>);


}