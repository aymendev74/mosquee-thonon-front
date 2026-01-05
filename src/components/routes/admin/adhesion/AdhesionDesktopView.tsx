import { FunctionComponent } from "react";
import { Button, Card, Col, Dropdown, Form, Row, Space, Table, Tag, Tooltip } from "antd";
import { CheckCircleOutlined, CheckCircleTwoTone, DeleteOutlined, DeleteTwoTone, DownOutlined, EditOutlined, EditTwoTone, EyeOutlined, EyeTwoTone, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AdhesionLight } from "../../../../services/adhesion";
import { StatutInscription } from "../../../../services/inscription";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../../utils/FormUtils";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { AdhesionViewProps } from "./types";
import type { MenuProps } from 'antd';
import { AdminSearchFilter } from "../../../common/AdminSearchFilter";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfAdhesion } from "../../../documents/PdfAdhesion";
import { getFileNameAdhesion } from "../../../common/tableDefinition";
import { PdfAuthContextBridge } from "../../../documents/PdfContextBridge";

export const AdhesionDesktopView: FunctionComponent<AdhesionViewProps> = ({
    dataSource,
    selectedAdhesions,
    setSelectedAdhesions,
    onValidateAdhesion,
    onValidateAdhesions,
    onDeleteAdhesion,
    onDeleteAdhesions,
    onSearch,
    onExport,
    renderPdf,
    generatePdf,
}) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";

    const doSearch = async () => {
        const { nom, prenom, statut, montant } = form.getFieldsValue();
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dateInscription.format(APPLICATION_DATE_FORMAT);
        }
        const searchCriteria = {
            nom: nom ?? null, 
            prenom: prenom ?? null, 
            statut: statut ?? null,
            dateInscription: dateInscription ?? null, 
            montant: montant ?? null
        };
        await onSearch(searchCriteria);
    };

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedAdhesions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) { 
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                navigate("/adhesion", { state: { isReadOnly: readOnly, id: selectedAdhesions[0].id, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { 
                onValidateAdhesions(selectedAdhesions);
            } else if (e.key === SUPPRIMER_MENU_KEY) { 
                onDeleteAdhesions(selectedAdhesions);
            }
        };

        const desktopActions: MenuProps['items'] = [
            { label: <><EyeTwoTone className="action-icon" />Consulter</>, key: CONSULTER_MENU_KEY, disabled: selectedAdhesions.length !== 1 },
            { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedAdhesions.length !== 1 }
        ];        
        const commonActions: MenuProps['items'] = [
            { label: <><CheckCircleTwoTone className="action-icon" />Valider</>, key: VALIDER_MENU_KEY, disabled: selectedAdhesions.length < 1 },
            { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedAdhesions.length < 1 }
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

    const inputFiltersConfig = [
        { name: "prenom", libelle: "Prénom", inputType: "InputText" as const },
        { name: "nom", libelle: "Nom", inputType: "InputText" as const },
        { name: "montant", libelle: "Montant", inputType: "InputNumber" as const, tooltip: "Rechercher les ahdésions dont le montant est supérieur à" },
        { name: "dateInscription", libelle: "Date adhésion", inputType: "Date" as const, tooltip: "Rechercher les ahdésions reçues à partir du" },
        {
            name: "statut", libelle: "Statut", inputType: "Select" as const, selectOptions: [
                { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                { value: StatutInscription.VALIDEE, label: "Validée" }
            ]
        },
    ];

    const columnsTableAdhesions: ColumnsType<AdhesionLight> = [
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
                return dayjs(record.dateInscription, APPLICATION_DATE_TIME_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, adhesion: AdhesionLight) => (
                <Space size="small">
                    <Tooltip title="Consulter">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => navigate("/adhesion", { state: { isReadOnly: true, id: adhesion.id, isAdmin: true } })}
                        />
                    </Tooltip>
                    <Tooltip title="Modifier">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => navigate("/adhesion", { state: { isReadOnly: false, id: adhesion.id, isAdmin: true } })}
                        />
                    </Tooltip>
                    <Tooltip title="Valider">
                        <Button
                            icon={<CheckCircleOutlined />}
                            size="small"
                            type="primary"
                            disabled={adhesion.statut === StatutInscription.VALIDEE}
                            onClick={() => onValidateAdhesion(adhesion.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDeleteAdhesion(adhesion.id)}
                        />
                    </Tooltip>
                    {renderPdf(adhesion.id) ? (
                        <PDFDownloadLink 
                            document={<PdfAuthContextBridge><PdfAdhesion id={adhesion.id} /></PdfAuthContextBridge>} 
                            fileName={getFileNameAdhesion(adhesion)}
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
                                onClick={() => generatePdf(adhesion.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: AdhesionLight[]) => {
            setSelectedAdhesions(selectedRows);
        }
    };

    const isInscriptionsSelected = () => {
        return dataSource && dataSource.length > 0;
    };

    const formatTotal = (total: number) => {
        if (total > 0) {
            return (<Tag color="geekblue">Total sélection : <strong>{total} adhésion(s)</strong></Tag>);
        } else {
            return (<Tag color="geekblue">Total sélection : <strong>{total}</strong></Tag>);
        }
    };

    return (
        <>
            <div className="desktop-filters">
                <Form
                    name="adminAdhesionDesktop"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="off"
                    form={form}
                >
                    <AdminSearchFilter doSearch={doSearch} inputFilters={inputFiltersConfig} />
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
                            <Tooltip color="geekblue" title="Exporter le résultat de la recherche dans un fichier Excel">
                                <Button icon={<FileExcelOutlined />} onClick={onExport} disabled={!isInscriptionsSelected()} type="primary">
                                    Exporter
                                </Button>
                            </Tooltip>
                        </div>

                        <Row>
                            <Col span={24}>
                                <Table 
                                    rowSelection={{ type: "checkbox", selectedRowKeys: selectedAdhesions.map(adhesion => adhesion.id), ...rowSelection }}
                                    columns={columnsTableAdhesions} 
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
                    Aucune adhésion trouvée
                </div>
            )}
        </>
    );
};
