import { AdhesionLight } from "../../../services/adhesion";

export interface AdhesionViewProps {
    dataSource: AdhesionLight[];
    selectedAdhesions: AdhesionLight[];
    setSelectedAdhesions: (adhesions: AdhesionLight[]) => void;
    onValidateAdhesion: (adhesionId: number) => Promise<void>;
    onValidateAdhesions: (adhesions: AdhesionLight[]) => Promise<void>;
    onDeleteAdhesion: (adhesionId: number) => Promise<void>;
    onDeleteAdhesions: (adhesions: AdhesionLight[]) => Promise<void>;
    onSearch: (searchCriteria: any) => Promise<void>;
    onExport: () => void;
}
