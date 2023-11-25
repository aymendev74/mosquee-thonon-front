import { Button, Modal, Table } from 'antd';
import { FunctionComponent, useState, useEffect } from 'react';
import { columnsTableInscriptions } from '../common/tableDefinition';
import { InscriptionLight } from '../../services/inscription';
import useApi from '../../hooks/useApi';
import { INSCRIPTION_ENDPOINT } from '../../services/services';

export type ModaleDerniersInscriptionProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export const ModaleDerniersInscription: FunctionComponent<ModaleDerniersInscriptionProps> = ({ open, setOpen }) => {
    const nbJours = 30;
    const [dataSource, setDataSource] = useState<InscriptionLight[]>();
    const { result } = useApi({ url: INSCRIPTION_ENDPOINT, method: "GET", params: { nbDerniersJours: nbJours } });

    useEffect(() => {
        setDataSource(result);
    }, [result]);

    return (<Modal open={open} footer={<Button onClick={() => setOpen(false)}>Fermer</Button>} width={800} onCancel={() => setOpen(false)}>
        <div className="centered-content">
            Vous trouverez ci-dessous la liste des inscriptions des {nbJours} derniers jours
        </div>
        <br />
        <div className="centered-content">
            <Table columns={columnsTableInscriptions} dataSource={dataSource} rowKey={record => record.id} />
        </div>
    </Modal>);

}