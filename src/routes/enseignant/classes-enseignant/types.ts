import { FormInstance } from "antd";
import { ClasseDtoF } from "../../../services/classe";

export interface ClassesEnseignantViewProps {
    form: FormInstance;
    classes: ClasseDtoF[];
    debutAnneeScolaire: number;
    doSearchClasses: (values: any) => Promise<void>;
    onConsulterClasse: (classeId: number) => void;
}
