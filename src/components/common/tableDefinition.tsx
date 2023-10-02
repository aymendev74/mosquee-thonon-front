import { ColumnsType } from "antd/es/table";
import { Inscription, StatutInscription } from "../../services/inscription";
import { Tooltip } from "antd";
import { CheckCircleTwoTone, PauseCircleTwoTone } from "@ant-design/icons";

export const columnsTableInscriptions: ColumnsType<Inscription> = [
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
        title: 'Sexe',
        dataIndex: 'sexe',
        key: 'sexe',
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
        dataIndex: 'signature.dateCreation',
        key: 'signature.dateCreation',
        render: (value, record, index) => {
            return record.signature?.dateCreation;
        }
    }
];