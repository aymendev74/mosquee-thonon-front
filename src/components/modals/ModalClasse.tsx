import { Button, Col, Divider, Form, Input, Modal, notification, Row, Spin, Table, Tag, Tooltip } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import _ from "lodash";
import { ApiCallbacks, buildUrlWithParams, CLASSES_ENDPOINT, ELEVES_ENDPOINT, ENSEIGNANT_ENDPOINT, EXISTING_CLASSES_ENDPOINT, handleApiCall } from "../../services/services";
import { AffectationEleveEnum, ClasseDtoB, ClasseDtoF, LienClasseEleveDto } from "../../services/classe";
import { InputFormItem } from "../common/InputFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { getJourActiviteOptions, getNiveauInterneEnfantOptions } from "../common/commoninputs";
import { EnseignantDto } from "../../services/enseignant";
import { EleveBack, EleveFront } from "../../services/eleve";
import { APPLICATION_DATE_FORMAT, prepareEleveBeforeForm, prepareEleveBeforeSave } from "../../utils/FormUtils";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";
import { SwitchFormItem } from "../common/SwitchFormItem";
import useApi from "../../hooks/useApi";


export type ModalClasseProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    classeToEdit?: ClasseDtoF,
    debutAnneeScolaire: number,
    finAnneeScolaire: number,
    enseignants: EnseignantDto[],
}

function getEnseignantsOptions(enseignants: EnseignantDto[]) {
    return enseignants?.map((enseignant) => ({ label: enseignant.prenom + " " + enseignant.nom, value: enseignant.id }));
}

export const ModalClasse: FunctionComponent<ModalClasseProps> = ({ open, setOpen, classeToEdit, enseignants, debutAnneeScolaire, finAnneeScolaire }) => {
    const { execute } = useApi();
    const [form] = Form.useForm();
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [elevesFiltres, setElevesFiltres] = useState<EleveFront[]>([]);
    const [selectedEleves, setSelectedEleves] = useState<EleveFront[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const close = () => {
        form.resetFields();
        setSelectedEleves([]);
        setOpen(false);
    };

    const getSelectedElevesAsLiens = () => {
        return selectedEleves?.map((eleve) => ({
            eleve: prepareEleveBeforeSave([eleve])[0],
        }));
    };

    const onValider = async () => {
        const classeForm = form.getFieldsValue();
        const classeToSave: ClasseDtoB = {
            id: classeToEdit?.id,
            libelle: classeForm.libelle,
            niveau: classeForm.niveau,
            liensClasseEleves: getSelectedElevesAsLiens(),
            activites: [{ jour: classeForm.jourActivite }],
            idEnseignant: enseignants.find((enseignant) => enseignant.id === classeForm.idEnseignant)?.id,
            debutAnneeScolaire,
            finAnneeScolaire
        }
        let result = null;
        if (classeToEdit) {
            result = await execute<ClasseDtoB>({ method: "PUT", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id: classeToEdit.id }), data: classeToSave });
            if (result.success) {
                notification.success({ message: "Les modifications ont bien été enregistrées" });
                setOpen(false);
            }
        } else {
            result = await execute<ClasseDtoB>({ method: "POST", url: CLASSES_ENDPOINT, data: classeToSave });
            if (result.success) {
                notification.success({ message: "La classe a bien été crée" });
                setOpen(false);
            }
        }
    }

    const getTitre = () => {
        return classeToEdit ? "Modification d'une classe" : "Création d'une nouvelle classe";
    }

    function initEleves(eleves: EleveFront[] | undefined) {
        if (eleves) {
            setEleves(eleves);
            setElevesFiltres([...eleves]);
            if (classeToEdit) {
                const elevesClasse = classeToEdit.liensClasseEleves?.map(lien => lien.eleve);
                if (elevesClasse && elevesClasse.length > 0) {
                    setSelectedEleves(elevesClasse);
                }
            }
        }
    }

    useEffect(() => {
        const loadData = async () => {
            const result = await execute<EleveBack[]>({
                method: "GET", url: ELEVES_ENDPOINT,
                params: {
                    anneeDebut: debutAnneeScolaire, anneeFin: finAnneeScolaire, affectation: AffectationEleveEnum.SANS_IMPORTANCE,
                    avecNiveau: false
                }
            });
            if (result.success) {
                const elevesF = result.successData?.map(eleve => prepareEleveBeforeForm([eleve])[0]);
                initEleves(elevesF);
            }

            // si modification, initialisation du formulaire avec la classe à modifier
            if (classeToEdit) {
                form.setFieldsValue({ ...classeToEdit });
                if (classeToEdit.activites && classeToEdit.activites.length > 0) {
                    form.setFieldValue("jourActivite", classeToEdit.activites[0].jour);
                }
            }
        }

        if (open) {
            loadData();
        } else {
            setElevesFiltres([]);
            setSelectedEleves([]);
            form.resetFields();
        }
    }, [open]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: EleveFront[]) => {
            setSelectedEleves(selectedRows);
        }
    };

    const columnsTableEleves: ColumnsType<EleveFront> = [
        {
            title: "Nom",
            dataIndex: "nom",
            key: "nom",
        },
        {
            title: "Prénom",
            dataIndex: "prenom",
            key: "prenom",
        },
        {
            title: "Niveau",
            dataIndex: "niveauInterne",
            key: "niveauInterne",
        },
        {
            title: "Date naissance",
            dataIndex: "dateNaissance",
            key: "dateNaissance",
            render: (value, record, index) => {
                return dayjs(record.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
        {
            title: "",
            dataIndex: "classeId",
            key: "classeId",
            render: (value, record, index) => {
                return record.classeId && record.classeId !== classeToEdit?.id
                    ? (<Tooltip color="red" title="Eleve affecté dans une autre classe"><WarningOutlined /></Tooltip>)
                    : <></>;
            }
        }
    ];

    async function onFilterEleves() {
        const filterField = form.getFieldValue("filterField");
        if (filterField) {
            const valeurNormalisee = filterField.toLowerCase();
            setElevesFiltres(eleves.filter(eleve => eleve.nom.toLowerCase().includes(valeurNormalisee) || eleve.prenom.toLowerCase().includes(valeurNormalisee)));
        } else {
            const result = await execute<EleveFront[]>({
                method: "GET", url: ELEVES_ENDPOINT,
                params: { anneeDebut: debutAnneeScolaire, anneeFin: finAnneeScolaire, affectation: AffectationEleveEnum.SANS_IMPORTANCE }
            });
            if (result.success && result.successData) {
                initEleves(result.successData);
            }
        }
    }

    function formatTotal(total: number) {
        return (<Tag color="geekblue">Total : <strong>{total} élève(s)</strong></Tag>);
    }

    function onEffectifSelected(checked: boolean) {
        if (checked) {
            setElevesFiltres(eleves.filter(eleve => selectedEleves.map(selectedEleve => selectedEleve.id).includes(eleve.id)));
        } else {
            onFilterEleves();
        }
    }

    return (<Modal title={getTitre()} open={open} width={800} onCancel={close}
        footer={<><Button onClick={close} icon={<CloseOutlined />}>Annuler</Button><Button onClick={onValider} icon={<CheckOutlined />} danger>Valider</Button></>}>
        <Form
            name="classe"
            autoComplete="off"
            form={form}
        >
            <Spin spinning={isLoading}>
                <Divider orientation="left">Informations concernant la classe</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem name="libelle" label="Libelle" rules={[{ required: true, message: "Veuillez saisir le libelle de la classe" }]} />
                    </Col>
                    <Col span={12}>
                        <SelectFormItem name="niveau" label="Niveau" options={getNiveauInterneEnfantOptions()} rules={[{ required: true, message: "Veuillez saisir le niveau de la classe" }]} />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <SelectFormItem name="idEnseignant" label="Enseignant" options={getEnseignantsOptions(enseignants)} />
                    </Col>
                    <Col span={12}>
                        <SelectFormItem name="jourActivite" label="Jour de classe" options={getJourActiviteOptions()} />
                    </Col>
                </Row>
                <Divider orientation="left">Sélection des élèves</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <InputFormItem name="filterField" label="Nom/Prénom" />
                    </Col>
                    <Col span={1}>
                        <Tooltip title="Filtrer les élèves sur le nom ou le prénom" color="geekblue">
                            <Button type="primary" onClick={onFilterEleves} icon={<SearchOutlined />} />
                        </Tooltip>
                    </Col>
                    <Col span={3}>
                        <Tooltip title="Visualiser l'effectif de la classe uniquement" color="geekblue">
                            <SwitchFormItem className="m-left-10" name="effectif" onChange={onEffectifSelected} />
                        </Tooltip>
                    </Col>
                </Row>
                <Table dataSource={elevesFiltres}
                    columns={columnsTableEleves}
                    rowSelection={{ type: "checkbox", selectedRowKeys: selectedEleves.map(eleve => eleve.id!), ...rowSelection }}
                    pagination={{ pageSize: 5, showSizeChanger: false, showTotal: formatTotal }}
                    rowKey={record => record.id!} />
            </Spin>
        </Form>
    </Modal>);

}