import { ColumnsType } from "antd/es/table";
import { InscriptionLight, StatutInscription } from "../../services/inscription";
import { Tooltip } from "antd";
import { CheckCircleTwoTone, FilePdfTwoTone, PauseCircleTwoTone, StopOutlined, WarningOutlined } from "@ant-design/icons";
import { AdhesionLight } from "../../services/adhesion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfAdhesion } from "../documents/PdfAdhesion";

export const columnsTableInscriptions: ColumnsType<InscriptionLight> = [
    {
        title: 'N° inscription',
        dataIndex: 'noInscription',
        key: 'noInscription',
    },
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
            if (value === StatutInscription.VALIDEE) return (<Tooltip title="Inscription validée" color="green"><CheckCircleTwoTone /></Tooltip>);
            else if (value === StatutInscription.PROVISOIRE) return (<Tooltip title="Inscription à valider" color="orange"><PauseCircleTwoTone /></Tooltip>);
            else if (value === StatutInscription.LISTE_ATTENTE) return (<Tooltip title="Liste d'attente" color="red"><WarningOutlined /></Tooltip>);
            else return (<Tooltip title="Refusée" color="red"><StopOutlined /></Tooltip>);
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

const getFileName = (adhesion: AdhesionLight) => {
    return "adhesion_" + adhesion.prenom + "_" + adhesion.nom;
}

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
            if (value === StatutInscription.VALIDEE) return (<Tooltip title="Adhésion validée" color="green"><CheckCircleTwoTone /></Tooltip>);
            else return (<Tooltip title="Adhésion à valider" color="orange"><PauseCircleTwoTone /></Tooltip>);
        }
    },
    {
        title: 'Date inscription',
        dataIndex: 'dateInscription',
        key: 'dateInscription',
        render: (value, record, index) => {
            return record.dateInscription as string;
        }
    },
    {
        title: "Fichier Pdf",
        key: "pdf",
        render: (value, record, index) => (<PDFDownloadLink document={<PdfAdhesion id={record.id} />} fileName={getFileName(record)}>
            {({ blob, url, loading, error }) => {
                return loading ? "Génération Pdf..." : <FilePdfTwoTone />
            }
            }
        </PDFDownloadLink>)
    },
];