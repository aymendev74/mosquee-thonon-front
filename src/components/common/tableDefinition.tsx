import { ColumnsType } from "antd/es/table";
import { Inscription, InscriptionLight, StatutInscription } from "../../services/inscription";
import { Tooltip } from "antd";
import { CheckCircleTwoTone, PauseCircleTwoTone } from "@ant-design/icons";
import { AdhesionLight } from "../../services/adhesion";

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
        title: 'Niveau',
        dataIndex: 'niveau',
        key: 'niveau',
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

export const columnsTableAdhesions: ColumnsType<AdhesionLight> = [
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
        title: 'Montant versement',
        dataIndex: 'montant',
        key: 'montant',
    },
    {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: (value, record, index) => {
            if (value === StatutInscription.VALIDEE) return (<Tooltip title="Inscription validée" color="green"><CheckCircleTwoTone /></Tooltip>);
            else if (value === StatutInscription.PROVISOIRE) return (<Tooltip title="Inscription à valider" color="orange"><PauseCircleTwoTone /></Tooltip>);
            else return (<Tooltip title="Liste d'attente" color="red"><PauseCircleTwoTone /></Tooltip>);
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