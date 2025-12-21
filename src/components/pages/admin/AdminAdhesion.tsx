import { useEffect, useState } from "react";
import { AdhesionLight, AdhesionPatchDto } from "../../../services/adhesion";
import { useNavigate } from "react-router-dom";
import { Form, Table, Button, Row, Col, Card, Tag, Spin, Tooltip, Dropdown, Menu, Collapse, Input, InputNumber, Select, DatePicker, Pagination, Checkbox, notification, Space } from "antd";
import { useMediaQuery } from 'react-responsive';
import type { MenuProps } from 'antd';
import { ADHESION_ENDPOINT, ADHESION_SEARCH_ENDPOINT, ApiCallbacks, DELETE_ADHESION_ENDPOINT, handleApiCall } from "../../../services/services";
import { CheckCircleOutlined, CheckCircleTwoTone, DeleteOutlined, DeleteTwoTone, DownOutlined, EditOutlined, EditTwoTone, EuroCircleOutlined, EyeOutlined, EyeTwoTone, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone, SearchOutlined } from "@ant-design/icons";
import { StatutInscription } from "../../../services/inscription";
import { getFileNameAdhesion } from "../../common/tableDefinition";
import { ModaleConfirmSuppressionInscription } from "../../modals/ModalConfirmSuppressionInscription";
import useApi from "../../../hooks/useApi";
import exportToExcel, { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT, ExcelColumnHeadersType } from "../../../utils/FormUtils";
import { PdfAdhesion } from "../../documents/PdfAdhesion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { AdminSearchFilter } from "../../common/AdminSearchFilter";
import { useAuth } from "../../../hooks/AuthContext";
import { UnahtorizedAccess } from "../UnahtorizedAccess";
import { PdfAuthContextBridge } from "../../documents/PdfContextBridge";

export const AdminAdhesion = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<AdhesionLight[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedAdhesions, setSelectedAdhesions] = useState<AdhesionLight[]>([]);
    const [renderedPdfAdhesionIds, setRenderedPdfAdhesionsIds] = useState<number[]>([]);
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);
    const [currentMobilePage, setCurrentMobilePage] = useState(1);
    const mobilePageSize = 10;
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const navigate = useNavigate();
    const { roles } = useAuth();
    const { execute } = useApi();

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";

    const excelColumnHeaders: ExcelColumnHeadersType<AdhesionLight> = { 
        nom: "Nom",
        prenom: "Prénom",
        ville: "Ville",
        montant: "Montant",
        statut: "Statut",
        dateInscription: "Date adhésion",
    };

    const exportData = () => {
        if (dataSource) {
            exportToExcel<AdhesionLight>(dataSource, excelColumnHeaders, `adhesion.xlsx`);
        }
    }

    const onConfirmSuppression = async () => {
        setModaleConfirmSuppressionOpen(false);
        console.log(selectedAdhesions.map(adhesion => adhesion.id));
        const resultDelete = await execute<number[]>({ method: "DELETE", url: DELETE_ADHESION_ENDPOINT, data: selectedAdhesions.map(adhesion => adhesion.id) });
        if (resultDelete.successData) {
            notification.open({ message: "Les " + resultDelete.successData.length + " adhésions sélectionnées ont été supprimées", type: "success" });
            const resultAdhesions = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
            setSelectedAdhesions([]);
            if (resultAdhesions.successData) {
                setDataSource(resultAdhesions.successData);
            }
        }
    }

    async function validateInscriptions() {
        const adhesionsPatches: AdhesionPatchDto[] = selectedAdhesions.map(adhesion => ({ id: adhesion.id, statut: StatutInscription.VALIDEE }));
        const resultValidate = await execute<number[]>({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { adhesions: adhesionsPatches } });
        if (resultValidate.successData) {
            notification.open({ message: "Les " + resultValidate.successData.length + " adhésions sélectionnées ont été validées", type: "success" });
            const resultAdhesions = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
            setSelectedAdhesions([]);
            if (resultAdhesions.successData) {
                setDataSource(resultAdhesions.successData);
            }
        }
    }

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedAdhesions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) { 
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                navigate("/adhesion", { state: { isReadOnly: readOnly, id: selectedAdhesions[0].id, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { 
                validateInscriptions()
            } else if (e.key === SUPPRIMER_MENU_KEY) { 
                setModaleConfirmSuppressionOpen(true);
            }
        };

        const desktopActions: MenuProps['items'] = [{ label: <><EyeTwoTone className="action-icon" />Consulter</>, key: CONSULTER_MENU_KEY, disabled: selectedAdhesions.length !== 1 },
        { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedAdhesions.length !== 1 }];        
        const commonActions: MenuProps['items'] = [{ label: <><CheckCircleTwoTone className="action-icon" />Valider</>, key: VALIDER_MENU_KEY, disabled: selectedAdhesions.length < 1 },
        { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedAdhesions.length < 1 }];
        const items: MenuProps['items'] = isMobile ? [...commonActions] : [...desktopActions, ...commonActions];
        
        const menu: MenuProps = { items, onClick: handleMenuClick } as MenuProps;

        return (
            <Dropdown menu={menu}>
                <Button>
                    Actions <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    const doSearch = async () => {
        const { nom, prenom, statut, montant } = form.getFieldsValue();
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dateInscription.format(APPLICATION_DATE_FORMAT);
        }
        const searchCriteria = {
            nom: nom ?? null, prenom: prenom ?? null, statut: statut ?? null,
            dateInscription: dateInscription ?? null, montant: montant ?? null
        }
        const result = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT, params: searchCriteria });
        if (result.successData) {
            setDataSource(result.successData);
            setCollapseActiveKey([]); // réduire le collapse et mettre en évidence les résultats (sur mobile)
        }
    }

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

    const SearchFilters = () => {
        return (
            <AdminSearchFilter doSearch={doSearch} inputFilters={inputFiltersConfig} />
        );
    };

    const SearchFiltersNoCard = () => {
        // Sur mobile, on garde uniquement les filtres essentiels
        const mobileFilterNames = ['prenom', 'nom', 'montant', 'statut'];
        const mobileFilters = inputFiltersConfig.filter(f => mobileFilterNames.includes(f.name));
        
        return (
            <div>
                {mobileFilters.map(filter => {
                    let inputElement;
                    
                    if (filter.inputType === "InputText") {
                        inputElement = <Input placeholder={filter.libelle} onPressEnter={doSearch} />;
                    } else if (filter.inputType === "InputNumber") {
                        inputElement = <InputNumber placeholder={filter.libelle} style={{ width: '100%' }} onPressEnter={doSearch} />;
                    } else if (filter.inputType === "Date") {
                        inputElement = <DatePicker placeholder={filter.libelle} style={{ width: '100%' }} onChange={doSearch} />;
                    } else if (filter.inputType === "Select" && 'selectOptions' in filter) {
                        inputElement = <Select placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
                    }

                    const formItem = (
                        <Form.Item key={filter.name} name={filter.name} label={filter.libelle}>
                            {inputElement}
                        </Form.Item>
                    );
                    
                    return filter.tooltip ? (
                        <Tooltip key={filter.name} title={filter.tooltip} color="geekblue">
                            {formItem}
                        </Tooltip>
                    ) : formItem;
                })}
                <div className="centered-content">
                    <Button icon={<SearchOutlined />} onClick={doSearch} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
                </div>
            </div>
        );
    };

    const MobileAdhesionCard = ({ adhesion }: { adhesion: AdhesionLight }) => {
        const isSelected = selectedAdhesions.some(a => a.id === adhesion.id);
        
        const handleCardClick = () => {
            if (isSelected) {
                setSelectedAdhesions(selectedAdhesions.filter(a => a.id !== adhesion.id));
            } else {
                setSelectedAdhesions([...selectedAdhesions, adhesion]);
            }
        };

        return (
            <Card className="adhesion-card-mobile" size="small">
                <div className="adhesion-card-header">
                    <div className="adhesion-card-name">
                        {adhesion.prenom} {adhesion.nom}
                    </div>
                    <Checkbox checked={isSelected} onChange={handleCardClick} />
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Montant:</span>
                    <span className="adhesion-card-value">{adhesion.montant} €</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Statut:</span>
                    <span className="adhesion-card-value">
                        {adhesion.statut === StatutInscription.VALIDEE ? (
                            <Tag color="green">Validée</Tag>
                        ) : (
                            <Tag color="orange">À valider</Tag>
                        )}
                    </span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Date:</span>
                    <span className="adhesion-card-value">
                        {dayjs(adhesion.dateInscription, APPLICATION_DATE_TIME_FORMAT).format(APPLICATION_DATE_FORMAT)}
                    </span>
                </div>
                <div className="adhesion-card-actions">
                    <Button size="small" type="primary" onClick={() => navigate("/adhesion", { state: { isReadOnly: true, id: adhesion.id, isAdmin: true } })}>
                        <EyeTwoTone /> Consulter
                    </Button>
                    <Button size="small" onClick={() => navigate("/adhesion", { state: { isReadOnly: false, id: adhesion.id, isAdmin: true } })}>
                        <EditTwoTone /> Modifier
                    </Button>
                    <Button 
                        size="small" 
                        type="primary"
                        disabled={adhesion.statut === StatutInscription.VALIDEE}
                        onClick={async () => {
                            const adhesionPatch: AdhesionPatchDto = { id: adhesion.id, statut: StatutInscription.VALIDEE };
                            const result = await execute<number[]>({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { adhesions: [adhesionPatch] } });
                            if (result.successData) {
                                notification.success({ message: "L'adhésion a été validée" });
                                const resultAdhesions = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
                                if (resultAdhesions.successData) {
                                    setDataSource(resultAdhesions.successData);
                                }
                            }
                        }}
                    >
                        <CheckCircleTwoTone /> Valider
                    </Button>
                    <Button 
                        size="small" 
                        danger
                        onClick={async () => {
                            const result = await execute<number[]>({ method: "DELETE", url: DELETE_ADHESION_ENDPOINT, data: [adhesion.id] });
                            if (result.successData) {
                                notification.success({ message: "L'adhésion a été supprimée" });
                                const resultAdhesions = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
                                if (resultAdhesions.successData) {
                                    setDataSource(resultAdhesions.successData);
                                }
                            }
                        }}
                    >
                        <DeleteTwoTone /> Supprimer
                    </Button>
                </div>
            </Card>
        );
    };

    useEffect(() => {
        const fetchAdhesions = async () => {
            const result = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
            if (result.successData) {
                setDataSource(result.successData);
            }
        }
        fetchAdhesions();
    }, []);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: AdhesionLight[]) => {
            setSelectedAdhesions(selectedRows);
        }
    };

    const isInscriptionsSelected = () => {
        return dataSource && dataSource.length > 0;
    };

    const renderPdf = (idAdhesion: number) => {
        return renderedPdfAdhesionIds.includes(idAdhesion);
    };

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
                            onClick={async () => {
                                const adhesionPatch: AdhesionPatchDto = { id: adhesion.id, statut: StatutInscription.VALIDEE };
                                const result = await execute<number[]>({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { adhesions: [adhesionPatch] } });
                                if (result.successData) {
                                    notification.success({ message: "L'adhésion a été validée" });
                                    const resultAdhesions = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
                                    if (resultAdhesions.successData) {
                                        setDataSource(resultAdhesions.successData);
                                    }
                                }
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={async () => {
                                const result = await execute<number[]>({ method: "DELETE", url: DELETE_ADHESION_ENDPOINT, data: [adhesion.id] });
                                if (result.successData) {
                                    notification.success({ message: "L'adhésion a été supprimée" });
                                    const resultAdhesions = await execute<AdhesionLight[]>({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
                                    if (resultAdhesions.successData) {
                                        setDataSource(resultAdhesions.successData);
                                    }
                                }
                            }}
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
                                onClick={() => setRenderedPdfAdhesionsIds([...renderedPdfAdhesionIds, adhesion.id])}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ]

    const formatTotal = (total: number) => {
        if (total > 0) {
            return (<Tag color="geekblue">Total sélection : <strong>{total} adhésion(s)</strong></Tag>);
        } else {
            return (<Tag color="geekblue">Total sélection : <strong>{total}</strong></Tag>);
        }
    }

    const filterCollapseItems: any[] = [
        {
            key: '1',
            label: <span><SearchOutlined /> Filtres de recherche</span>,
            children: <SearchFiltersNoCard />
        }
    ];

    return roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_TRESORIER") ? (
        <div className="centered-content">
            <Form
                name="adminAdhesion"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                autoComplete="off"
                className="container-full-width"
                form={form}
            >
                <h2 className="adhesion-title">
                    <EuroCircleOutlined /> Administration des adhésions
                </h2>
                <Spin spinning={isLoading}>
                    <div className="search-result-container">
                        {isMobile ? (
                            <Collapse 
                                activeKey={collapseActiveKey}
                                onChange={(keys) => setCollapseActiveKey(keys as string[])}
                                items={filterCollapseItems} 
                                className="mobile-filters-collapse"                                 
                            />
                        ) : (
                            <div className="desktop-filters">
                                <SearchFilters />
                            </div>
                        )}
                        
                        {dataSource && dataSource.length > 0 ? (
                            <div className={isMobile ? "mobile-results" : "desktop-results"}>
                                {isMobile ? (
                                    <>
                                        <div className="mobile-results-header">
                                            <h3>Résultats</h3>
                                        </div>
                                        <div className="menu-action-container">
                                            <div className="label">Action à effectuer :</div>
                                            <div className="bt-action">
                                                <DropdownMenu />
                                            </div>                                            
                                        </div>
                                        <div className="adhesion-cards-mobile">
                                            {dataSource
                                                .slice((currentMobilePage - 1) * mobilePageSize, currentMobilePage * mobilePageSize)
                                                .map(adhesion => (
                                                    <MobileAdhesionCard key={adhesion.id} adhesion={adhesion} />
                                                ))}
                                            <div className="mobile-pagination">
                                                <Pagination
                                                    current={currentMobilePage}
                                                    pageSize={mobilePageSize}
                                                    total={dataSource.length}
                                                    onChange={(page) => setCurrentMobilePage(page)}
                                                    showSizeChanger={false}
                                                    showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} adhésions`}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Card title="Résultats" bordered={false}>
                                        <div className="menu-action-container">
                                            <div className="label">Veuillez choisir une action à effectuer :</div>
                                            <div className="bt-action">
                                                <DropdownMenu />
                                            </div>
                                            <Tooltip color="geekblue" title="Exporter le résultat de la recherche dans un fichier Excel">
                                                <Button icon={<FileExcelOutlined />} onClick={exportData} disabled={!isInscriptionsSelected()} type="primary">
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
                                )}
                            </div>
                        ) : (
                            <div className="no-results">
                                Aucune adhésion trouvée
                            </div>
                        )}
                    </div>

                    <ModaleConfirmSuppressionInscription 
                        open={modaleConfirmSuppressionOpen} 
                        setOpen={setModaleConfirmSuppressionOpen}
                        nbInscriptions={selectedAdhesions.length}
                        onConfirm={onConfirmSuppression} 
                    />
                </Spin>
            </Form>
        </div>
    ) : <UnahtorizedAccess />;
}