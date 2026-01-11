import { FormInstance } from "antd";
import { ClasseDtoF } from "../../../services/classe";
import { UserDto } from "../../../services/user";

export interface ClasseViewProps {
    form: FormInstance;
    enseignants: UserDto[];
    classes: ClasseDtoF[];
    debutAnneeScolaire: number;
    onCreateClasse: () => void;
    onModifierClasse: (classe: ClasseDtoF) => void;
    onDeleteClasse: (classe: ClasseDtoF) => void;
    doSearchClasses: (values: any) => Promise<void>;
    handleAnneeScolaireChanged: (val: any) => void;
}
