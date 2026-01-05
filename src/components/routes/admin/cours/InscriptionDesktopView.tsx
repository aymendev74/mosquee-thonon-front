import { FunctionComponent } from "react";
import { Button, Card, Col, Dropdown, Form, Row, Space, Table, Tag, Tooltip } from "antd";
import { CheckCircleOutlined, CheckCircleTwoTone, DeleteOutlined, DeleteTwoTone, DownOutlined, EditOutlined, EditTwoTone, EyeOutlined, EyeTwoTone, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone, StopOutlined, WarningOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { InscriptionLight, StatutInscription } from "../../../../services/inscription";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../../utils/FormUtils";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { InscriptionViewProps } from "./types";
import type { MenuProps } from 'antd';
import { AdminSearchFilter, InputSearchFieldDef } from "../../../common/AdminSearchFilter";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { getFileNameInscription } from "../../../common/tableDefinition";
import { PdfAuthContextBridge } from "../../../documents/PdfContextBridge";
import { PdfInscriptionCoursEnfant } from "../../../documents/PdfInscriptionCoursEnfant";
import { PdfInscriptionCoursArabeAdulte } from "../../../documents/PdfInscriptionCoursArabeAdulte";
import { useMatieresStore } from "../../../stores/useMatieresStore";
import { TypeMatiereEnum } from "../../../../services/classe";
import { getLibelleNiveauScolaire, getNiveauInterneAdulteOptions, getNiveauInterneEnfantOptions, getNiveauOptions, getStatutInscriptionOptions } from "../../../common/commoninputs";

export const InscriptionDesktopView: FunctionComponent<InscriptionViewProps> = ({
    application,
    type,
    dataSource,
    selectedInscriptions,
    setSelectedInscriptions,
    periodesOptions,
    inscriptionsEnfantsById,
    inscriptionsAdultesById,
    onValidateInscription,
    onValidateInscriptions,
    onDeleteInscription,
    onDeleteInscriptions,
    onSearch,
    onExport,
    onLoadInscription,
    renderPdf,
}) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { getMatieresByType } = useMatieresStore();

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";

    const buildSearchCriteria = () => {
        const { nom, prenom, telephone, statut, noInscription, idPeriode } = form.getFieldsValue();
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dayjs(dateInscription).format(APPLICATION_DATE_FORMAT);
        }
        const niveaux = form.getFieldValue("niveau");
        const niveauxInternes = form.getFieldValue("niveauInterne");
        const searchType = application === "COURS_ENFANT" ? "ENFANT" : "ADULTE";
        return {
            nom: nom ?? null, 
            prenom: prenom ?? null, 
            telephone: telephone ?? null,
            statut: statut ?? null, 
            dateInscription: dateInscription ?? null, 
            niveaux: niveaux ?? null,
            niveauxInternes: niveauxInternes ?? null, 
            noInscription: noInscription ?? null, 
            idPeriode: idPeriode ?? null,
            type: searchType
        };
    };

    const doSearch = async () => {
        const searchCriteria = buildSearchCriteria();
        await onSearch(searchCriteria);
    };

    const DropdownMenu = () => {
        const handleMenuClick = async (e: any) => {
            if (selectedInscriptions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) {
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                navigate(path, { state: { isReadOnly: readOnly, id: selectedInscriptions[0].idInscription, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) {
                await onValidateInscriptions(selectedInscriptions);
            } else if (e.key === SUPPRIMER_MENU_KEY) {
                await onDeleteInscriptions(selectedInscriptions);
            }
        };

        const desktopActions: MenuProps['items'] = [
            { label: <><EyeTwoTone className="action-icon" />Consulter</>, key: CONSULTER_MENU_KEY, disabled: selectedInscriptions.length !== 1 },
            { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedInscriptions.length !== 1 }
        ];        
        const commonActions: MenuProps['items'] = [
            { label: <><CheckCircleTwoTone className="action-icon" />Valider</>, key: VALIDER_MENU_KEY, disabled: selectedInscriptions.length < 1 },
            { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedInscriptions.length < 1 }
        ];
        const items: MenuProps['items'] = [...desktopActions, ...commonActions];
        
        const menu: MenuProps = { items, onClick: handleMenuClick } as MenuProps;

        return (
            <Dropdown menu={menu}>
                <Button>
                    Actions <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    const getSearchFilters = () => {
        let filters: InputSearchFieldDef[] = [
            { name: "idPeriode", libelle: "Période", inputType: "Select", selectOptions: periodesOptions },
            { name: "prenom", libelle: "Prénom", inputType: "InputText" },
            { name: "nom", libelle: "Nom", inputType: "InputText" },
            { name: "noInscription", libelle: "N° inscription", inputType: "InputText" },
            {
                name: "niveauInterne", libelle: "Niveau interne", inputType: "SelectTags",
                selectOptions: application === "COURS_ENFANT" ? getNiveauInterneEnfantOptions() : getNiveauInterneAdulteOptions()
            },
            { name: "telephone", libelle: "Téléphone", inputType: "InputText" },
            { name: "dateInscription", libelle: "Date inscription", inputType: "Date", tooltip: "Rechercher les inscription reçues à partir du" },
            {
                name: "statut", libelle: "Statut", inputType: "Select", selectOptions: getStatutInscriptionOptions()
            },
        ];

        if (application === "COURS_ENFANT") {
            filters.splice(4, 0, { name: "niveau", libelle: "Niveau", inputType: "SelectTags", selectOptions: getNiveauOptions() });
        }
        return filters;
    };

    const getDocumentContent = (idInscription: number) => {
        if (type === "ENFANT") {
            return (
                <PdfAuthContextBridge>
                    <PdfInscriptionCoursEnfant inscription={inscriptionsEnfantsById[idInscription]} />
                </PdfAuthContextBridge>
            );
        } else {
            return (
                <PdfAuthContextBridge>
                    <PdfInscriptionCoursArabeAdulte inscription={inscriptionsAdultesById[idInscription]} matieres={getMatieresByType(TypeMatiereEnum.ADULTE)} />
                </PdfAuthContextBridge>
            );
        }
    };

    const columnsTableInscriptions: ColumnsType<InscriptionLight> = [
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
            render: (value, record, index) => {
                return getLibelleNiveauScolaire(value);
            }
        },
        {
            title: 'Niveau interne',
            dataIndex: 'niveauInterne',
            key: 'niveauInterne',
        },
        {
            title: 'Téléphone',
            dataIndex: 'mobile',
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
                return dayjs(record.dateInscription, APPLICATION_DATE_TIME_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, inscription: InscriptionLight) => (
                <Space size="small">
                    <Tooltip title="Consulter">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                                const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                                navigate(path, { state: { isReadOnly: true, id: inscription.idInscription, isAdmin: true } });
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Modifier">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                                navigate(path, { state: { isReadOnly: false, id: inscription.idInscription, isAdmin: true } });
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Valider">
                        <Button
                            icon={<CheckCircleOutlined />}
                            size="small"
                            type="primary"
                            disabled={inscription.statut === StatutInscription.VALIDEE}
                            onClick={() => onValidateInscription(inscription.idInscription)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDeleteInscription(inscription.idInscription)}
                        />
                    </Tooltip>
                    {renderPdf(inscription.idInscription) ? (
                        <PDFDownloadLink 
                            document={getDocumentContent(inscription.idInscription)} 
                            fileName={getFileNameInscription(inscription)}
                        >
                            {({ blob, url, loading, error }) => (
                                <Tooltip title={loading ? "Génération PDF..." : "Télécharger PDF"}>
                                    <Button
                                        icon={<FilePdfTwoTone />}
                                        size="small"
                                        loading={loading}
                                    />
                                </Tooltip>
                            )}
                        </PDFDownloadLink>
                    ) : (
                        <Tooltip title="Générer PDF">
                            <Button
                                icon={<FilePdfTwoTone />}
                                size="small"
                                type="primary"
                                onClick={() => onLoadInscription(inscription.idInscription)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: InscriptionLight[]) => {
            setSelectedInscriptions(selectedRows);
        }
    };

    const isInscriptionsSelected = () => {
        return dataSource && dataSource.length > 0;
    };

    const getNbDistinctsInscription = () => {
        return new Set(dataSource?.map(inscription => inscription.idInscription)).size;
    };

    const formatTotal = (total: number) => {
        if (total > 0) {
            return (<Tag color="geekblue">Total sélection : <strong>{total} élève(s)</strong> (<strong>{getNbDistinctsInscription()} inscription(s)</strong>)</Tag>);
        } else {
            return (<Tag color="geekblue">Total sélection : <strong>{total}</strong></Tag>);
        }
    };

    return (
        <>
            <div className="desktop-filters">
                <Form
                    name="adminInscriptionDesktop"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="off"
                    form={form}
                >
                    <AdminSearchFilter doSearch={doSearch} inputFilters={getSearchFilters()} />
                </Form>
            </div>
            
            {dataSource && dataSource.length > 0 ? (
                <div className="desktop-results">
                    <Card title="Résultats" bordered={false}>
                        <div className="menu-action-container">
                            <div className="label">Veuillez choisir une action à effectuer :</div>
                            <div className="bt-action">
                                <DropdownMenu />
                            </div>
                            <Tooltip color="geekblue" title="Exporter le resultat de la recherche dans un fichier Excel">
                                <Button icon={<FileExcelOutlined />} onClick={onExport} disabled={!isInscriptionsSelected()} type="primary">
                                    Exporter
                                </Button>
                            </Tooltip>
                        </div>

                        <Row>
                            <Col span={24}>
                                <Table 
                                    rowSelection={{ type: "checkbox", selectedRowKeys: selectedInscriptions.map(inscription => inscription.id), ...rowSelection }}
                                    columns={columnsTableInscriptions} 
                                    dataSource={dataSource} 
                                    rowKey={record => record.id}
                                    pagination={{ showTotal: formatTotal }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </div>
            ) : (
                <div className="no-results">
                    Aucune inscription trouvée
                </div>
            )}
        </>
    );
};
