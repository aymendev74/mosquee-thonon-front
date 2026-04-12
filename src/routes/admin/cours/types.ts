import { InscriptionLight } from "../../../services/inscription";
import { DefaultOptionType } from "antd/es/select";

export interface InscriptionViewProps {
    application: string;
    type: "ADULTE" | "ENFANT";
    dataSource: InscriptionLight[];
    selectedInscriptions: InscriptionLight[];
    setSelectedInscriptions: (inscriptions: InscriptionLight[]) => void;
    periodesOptions?: DefaultOptionType[];
    onValidateInscription: (inscriptionId: number) => Promise<void>;
    onValidateInscriptions: (inscriptions: InscriptionLight[]) => Promise<void>;
    onDeleteInscription: (inscriptionId: number) => Promise<void>;
    onDeleteInscriptions: (inscriptions: InscriptionLight[]) => Promise<void>;
    onSearch: (searchCriteria: any) => Promise<void>;
    onExport: () => void;
}
