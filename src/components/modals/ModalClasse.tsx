import { Button, Card, Checkbox, Col, Divider, Form, Input, Modal, notification, Pagination, Row, Spin, Table, Tag, Tooltip } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import { useMediaQuery } from 'react-responsive';
import _ from "lodash";
import { ApiCallbacks, buildUrlWithParams, CLASSES_ENDPOINT, ELEVES_ENDPOINT, ENSEIGNANT_ENDPOINT, EXISTING_CLASSES_ENDPOINT, handleApiCall } from "../../services/services";
import { AffectationEleveEnum, ClasseDtoB, ClasseDtoF, LienClasseEleveDto } from "../../services/classe";
import { InputFormItem } from "../common/InputFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { getJourActiviteOptions, getNiveauInterneEnfantOptions } from "../common/commoninputs";
import { EleveBack, EleveFront } from "../../services/eleve";
import { APPLICATION_DATE_FORMAT, prepareEleveBeforeForm, prepareEleveBeforeSave } from "../../utils/FormUtils";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";
import { SwitchFormItem } from "../common/SwitchFormItem";
import useApi from "../../hooks/useApi";
import { UserDto } from "../../services/user";

export type ModalClasseProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    classeToEdit?: ClasseDtoF,
    debutAnneeScolaire: number,
    finAnneeScolaire: number,
    enseignants: UserDto[],
}

function getEnseignantsOptions(enseignants: UserDto[]) {
    return enseignants?.map((enseignant) => ({ label: enseignant.prenom + " " + enseignant.nom, value: enseignant.id }));
}

export const ModalClasse: FunctionComponent<ModalClasseProps> = ({ open, setOpen, classeToEdit, enseignants, debutAnneeScolaire, finAnneeScolaire }) => {
    const { execute } = useApi();
    const [form] = Form.useForm();
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [elevesFiltres, setElevesFiltres] = useState<EleveFront[]>([]);
    const [selectedEleves, setSelectedEleves] = useState<EleveFront[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const close = () => {
        form.resetFields();
        setSelectedEleves([]);
        setCurrentPage(1);
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
            idUtilisateur: enseignants.find((enseignant) => enseignant.id === classeForm.idUtilisateur)?.id,
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
            setCurrentPage(1);
            form.resetFields();
        }
    }, [open]);

    const toggleEleveSelection = (eleve: EleveFront) => {
        const isSelected = selectedEleves.some(e => e.id === eleve.id);
        if (isSelected) {
            setSelectedEleves(selectedEleves.filter(e => e.id !== eleve.id));
        } else {
            setSelectedEleves([...selectedEleves, eleve]);
        }
    };

    const renderElevesCards = () => {
        const pageSize = 5;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentEleves = elevesFiltres.slice(startIndex, endIndex);

        return (
            <>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    {currentEleves.map((eleve) => {
                        const isSelected = selectedEleves.some(e => e.id === eleve.id);
                        const isInOtherClass = eleve.classeId && eleve.classeId !== classeToEdit?.id;
                        
                        return (
                            <Col xs={24} key={eleve.id}>
                                <Card
                                    size="small"
                                    hoverable
                                    onClick={() => toggleEleveSelection(eleve)}
                                    style={{
                                        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e6f7ff' : '#fff'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Checkbox checked={isSelected} />
                                                <strong>{eleve.nom} {eleve.prenom}</strong>
                                                {isInOtherClass && (
                                                    <Tooltip color="red" title="Élève affecté dans une autre classe">
                                                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                                                    </Tooltip>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8c8c8c' }}>
                                                <span><strong>Niveau:</strong> {eleve.niveauInterne}</span>
                                                <span><strong>Né(e) le:</strong> {dayjs(eleve.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
                {elevesFiltres.length > pageSize && (
                    <Row style={{ justifyContent: 'center', marginTop: '16px' }}>
                        <Col>
                            <Pagination
                                current={currentPage}
                                total={elevesFiltres.length}
                                pageSize={pageSize}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                                simple
                                showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total}`}
                            />
                        </Col>
                    </Row>
                )}
            </>
        );
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

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: EleveFront[]) => {
            setSelectedEleves(selectedRows);
        },
        preserveSelectedRowKeys: true
    };

    const onFilterEleves = async () => {
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
                setElevesFiltres([...result.successData]);
            }
        }
        setCurrentPage(1);
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
        setCurrentPage(1);
    }

    return (<Modal title={getTitre()} open={open} width={isMobile ? '100%' : 800} onCancel={close}
        footer={<><Button onClick={close} icon={<CloseOutlined />}>Annuler</Button><Button onClick={onValider} icon={<CheckOutlined />} type="primary">Valider</Button></>}>
        <Form
            name="classe"
            autoComplete="off"
            form={form}
        >
            <Spin spinning={isLoading}>
                <Divider orientation="left">Informations concernant la classe</Divider>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <InputFormItem name="libelle" label="Libelle" rules={[{ required: true, message: "Veuillez saisir le libelle de la classe" }]} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <SelectFormItem name="niveau" label="Niveau" options={getNiveauInterneEnfantOptions()} rules={[{ required: true, message: "Veuillez saisir le niveau de la classe" }]} />
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <SelectFormItem name="idUtilisateur" label="Enseignant" options={getEnseignantsOptions(enseignants)} />
                    </Col>
                    <Col xs={24} sm={12}>
                        <SelectFormItem name="jourActivite" label="Jour de classe" options={getJourActiviteOptions()} />
                    </Col>
                </Row>
                <Divider orientation="left">Sélection des élèves</Divider>
                <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col xs={18} sm={12}>
                        <InputFormItem name="filterField" label="Nom/Prénom" />
                    </Col>
                    <Col xs={6} sm={2}>
                        <Form.Item label=" " colon={false}>
                            <Tooltip title="Filtrer" color="geekblue">
                                <Button type="primary" onClick={onFilterEleves} icon={<SearchOutlined />} block />
                            </Tooltip>
                        </Form.Item>
                    </Col>
                    {!isMobile && (
                        <Col sm={4}>
                            <Tooltip title="Visualiser l'effectif de la classe uniquement" color="geekblue">
                                <SwitchFormItem name="effectif" onChange={onEffectifSelected} />
                            </Tooltip>
                        </Col>
                    )}
                </Row>
                {isMobile && (
                    <>
                        <Row style={{ marginBottom: '12px' }}>
                            <Col span={24}>
                                <Tag color="geekblue">Total : <strong>{elevesFiltres.length} élève(s)</strong></Tag>
                                <Tag color="blue" style={{ marginLeft: '8px' }}>Sélectionnés : <strong>{selectedEleves.length}</strong></Tag>
                            </Col>
                        </Row>
                        <Row style={{ marginBottom: '16px' }}>
                            <Col span={24}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>Afficher uniquement l'effectif sélectionné :</span>
                                    <SwitchFormItem name="effectif" onChange={onEffectifSelected} style={{ marginBottom: 0 }} />
                                </div>
                            </Col>
                        </Row>
                    </>
                )}
                {isMobile ? renderElevesCards() : (
                    <Table dataSource={elevesFiltres}
                        columns={columnsTableEleves}
                        rowSelection={{ type: "checkbox", selectedRowKeys: selectedEleves.map(eleve => eleve.id!), ...rowSelection }}
                        pagination={{ pageSize: 5, showSizeChanger: false, showTotal: formatTotal }}
                        rowKey={record => record.id!} />
                )}
            </Spin>
        </Form>
    </Modal>);
}