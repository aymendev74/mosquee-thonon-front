import { ColumnsType } from "antd/es/table";
import { Inscription, InscriptionLight, StatutInscription } from "../../services/inscription";
import { Tooltip } from "antd";
import { CheckCircleTwoTone, PauseCircleTwoTone } from "@ant-design/icons";

export const columnsTableInscriptions: ColumnsType<InscriptionLight> = [
    {
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
    },
    {
        title: 'Prénom',
        dataIndex: 'prenom',
        key: 'prenom',
    },
    {
        title: 'Téléphone',
        dataIndex: 'telephone',
        key: 'telephone',
    },
    {
        title: 'Ville',
        dataIndex: 'ville',
        key: 'ville',
    },
    {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: (value, record, index) => {
            return (value === StatutInscription.VALIDEE ?
                <Tooltip title="Inscription validée" color="green"><CheckCircleTwoTone /></Tooltip> :
                <Tooltip title="Inscription non validée" color="red"><PauseCircleTwoTone /></Tooltip>);
        }
    },
    {
        title: 'Date inscription',
        dataIndex: 'dateInscription',
        key: 'dateInscription',
        render: (value, record, index) => {
            return record.dateInscription as string;
        }
    }
];