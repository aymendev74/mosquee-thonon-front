import { useState, useEffect } from "react";
import { FormInstance, notification } from "antd";
import useApi from "../../../../hooks/useApi";
import { buildUrlWithParams, CLASSES_ENDPOINT, EXISTING_CLASSES_ENDPOINT, USER_ENDPOINT } from "../../../../services/services";
import { ClasseDtoB, ClasseDtoF } from "../../../../services/classe";
import { prepareClasseBeforeForm } from "../../../../utils/FormUtils";
import { UserDto } from "../../../../services/user";
import { valueType } from "antd/es/statistic/utils";
import dayjs from "dayjs";

export const useClasseManagement = (form: FormInstance) => {
    const { execute, isLoading } = useApi();
    const [enseignants, setEnseignants] = useState<UserDto[]>([]);
    const [classes, setClasses] = useState<ClasseDtoF[]>([]);
    const [modalClasseOpen, setModalClasseOpen] = useState(false);
    const [debutAnneeScolaire, setDebutAnneeScolaire] = useState<number>(dayjs().year());
    const [classeToEdit, setClasseToEdit] = useState<ClasseDtoF | undefined>();
    const [modalDeleteClasseOpen, setModalDeleteClasseOpen] = useState(false);
    const [classeToDelete, setClasseToDelete] = useState<number | undefined>();

    const doSearchClasses = async (values: any) => {
        const params = { anneeDebut: values.anneeDebut, anneeFin: values.anneeFin ?? values.anneeDebut + 1 };
        const resultClasses = await execute<ClasseDtoB[]>({ method: "GET", url: CLASSES_ENDPOINT, params });
        if (resultClasses.success && resultClasses.successData) {
            const classesF = resultClasses.successData.map(classe => prepareClasseBeforeForm(classe));
            setClasses(classesF);
        }
    };

    const loadEnseignants = async () => {
        const resultEnseignants = await execute<UserDto[]>({ method: "GET", url: USER_ENDPOINT, params: { role: "ROLE_ENSEIGNANT" } });
        if (resultEnseignants.success && resultEnseignants.successData) {
            setEnseignants(resultEnseignants.successData);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!modalClasseOpen) {
                doSearchClasses({ anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 });
                loadEnseignants();
            }
        };
        loadData();
    }, [modalClasseOpen]);

    const onCreateClasse = () => {
        const debutAnneeScolaire: number = form.getFieldValue("anneeDebut");
        if (!debutAnneeScolaire) {
            notification.warning({ message: "Veuillez sélectionner une année avant de pouvoir créer une classe" });
            return;
        }
        setDebutAnneeScolaire(debutAnneeScolaire);
        setClasseToEdit(undefined);
        setModalClasseOpen(true);
    };

    const onModifierClasse = (classe: ClasseDtoF) => {
        setClasseToEdit(classe);
        setModalClasseOpen(true);
    };

    const onDeleteClasse = (classe: ClasseDtoF) => {
        setClasseToDelete(classe.id);
        setModalDeleteClasseOpen(true);
    };

    const onConfirmDeleteClasse = async () => {
        await execute({ method: "DELETE", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id: classeToDelete }) });
        doSearchClasses({ anneeDebut: debutAnneeScolaire, anneeFin: debutAnneeScolaire + 1 });
        setModalDeleteClasseOpen(false);
    };

    const handleAnneeScolaireChanged = (val: valueType | null) => {
        if (!val) return;
        const anneeDebut = typeof val === "string" ? parseFloat(val) : val;
        if (!isNaN(anneeDebut)) {
            setDebutAnneeScolaire(anneeDebut);
        }
    };

    return {
        enseignants,
        classes,
        modalClasseOpen,
        debutAnneeScolaire,
        classeToEdit,
        modalDeleteClasseOpen,
        isLoading,
        setModalClasseOpen,
        setModalDeleteClasseOpen,
        doSearchClasses,
        onCreateClasse,
        onModifierClasse,
        onDeleteClasse,
        onConfirmDeleteClasse,
        handleAnneeScolaireChanged,
    };
};
