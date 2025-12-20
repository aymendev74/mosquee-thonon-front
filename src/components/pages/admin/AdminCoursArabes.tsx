import { FunctionComponent, useEffect, useState } from "react";
import { InscriptionAdulteBack, InscriptionEnfantBack, InscriptionLight, InscriptionPatchDto, StatutInscription } from "../../../services/inscription";
import { ApiCallbacks, buildUrlWithParams, handleApiCall, INSCRIPTION_ADULTE_ENDPOINT, INSCRIPTION_ENDPOINT, INSCRIPTION_ENFANT_ENDPOINT, PERIODES_ENDPOINT } from "../../../services/services";
import { useLocation, useNavigate } from "react-router-dom";
import Table, { ColumnsType } from "antd/es/table";
import { Button, Card, Col, Collapse, Dropdown, Form, MenuProps, Row, Spin, Tag, Tooltip, notification, Pagination, Checkbox, Input, InputNumber, Select, DatePicker } from "antd";
import { useMediaQuery } from 'react-responsive';
import { CheckCircleTwoTone, DeleteTwoTone, DownOutlined, EditTwoTone, EyeTwoTone, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone, StopOutlined, TeamOutlined, UserOutlined, WarningOutlined, SearchOutlined } from "@ant-design/icons";
import { ModaleConfirmSuppressionInscription } from "../../modals/ModalConfirmSuppressionInscription";
import { getLibelleNiveauScolaire, getNiveauInterneAdulteOptions, getNiveauInterneEnfantOptions, getNiveauOptions, getStatutInscriptionOptions } from "../../common/commoninputs";
import exportToExcel, { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT, ExcelColumnHeadersType } from "../../../utils/FormUtils";
import { DefaultOptionType } from "antd/es/select";
import { PeriodeInfoDto } from "../../../services/periode";
import { getPeriodeOptions } from "../../common/CommonComponents";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PdfInscriptionCoursEnfant } from "../../documents/PdfInscriptionCoursEnfant";
import { getFileNameInscription } from "../../common/tableDefinition";
import { AdminSearchFilter, InputSearchFieldDef } from "../../common/AdminSearchFilter";
import { PdfInscriptionCoursArabeAdulte } from "../../documents/PdfInscriptionCoursArabeAdulte";
import { useAuth } from "../../../hooks/AuthContext";
import { UnahtorizedAccess } from "../UnahtorizedAccess";
import { PdfAuthContextBridge } from "../../documents/PdfContextBridge";
import useApi from "../../../hooks/useApi";
import { useMatieresStore } from "../../stores/useMatieresStore";
import { TypeMatiereEnum } from "../../../services/classe";

export const AdminCoursArabes: FunctionComponent = () => {

    const location = useLocation();
    const application = location.state?.application; // ADULTE ou ENFANT
    const type = application === "COURS_ADULTE" ? "ADULTE" : "ENFANT";
    const [dataSource, setDataSource] = useState<InscriptionLight[]>();
    const { roles } = useAuth();
    const navigate = useNavigate();
    const { execute, isLoading } = useApi();
    const [form] = Form.useForm();
    const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionLight[]>([]);
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [inscriptionsEnfantsById, setInscriptionsEnfantsById] = useState<Record<number, InscriptionEnfantBack>>({});
    const [inscriptionsAdultesById, setInscriptionsAdultesById] = useState<Record<number, InscriptionAdulteBack>>({});
    const [currentMobilePage, setCurrentMobilePage] = useState(1);
    const mobilePageSize = 10;
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const { getMatieresByType } = useMatieresStore();

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";
    const icon = type === "ENFANT" ? <TeamOutlined /> : <UserOutlined />;

    let excelColumnHeaders: ExcelColumnHeadersType<InscriptionLight> = { // commun aux cours adultes et enfant
        nom: "Nom élève",
        prenom: "Prénom élève",
        dateNaissance: "Date naissance",
        niveauInterne: "Niveau interne",
        mobile: "Tél.",
        email: "E-mail",
        ville: "Ville",
        noInscription: "Numéro inscription",
        dateInscription: "Date d'inscription",
    };

    if (application === "COURS_ENFANT") { // données spécifiques aux enfants
        excelColumnHeaders = {
            ...excelColumnHeaders,
            niveau: "Niveau publique",
            nomResponsableLegal: "Nom responsable légal",
            prenomResponsableLegal: "Prénom responsable légal",
            nomContactUrgence: "Nom autre contact",
            prenomContactUrgence: "Prénom autre contact",
            mobileContactUrgence: "Tél. autre contact",
            autorisationAutonomie: "Autorisation à rentrer seul",
            autorisationMedia: "Autorisation photos/vidéos",
        }
    };

    const exportData = () => {
        if (dataSource) {
            exportToExcel<InscriptionLight>(dataSource, excelColumnHeaders, `inscriptions-${type}`);
        }
    };

    async function loadInscriptions(params?: any) {
        const resultInscriptions = await execute<InscriptionLight[]>({ method: "GET", url: INSCRIPTION_ENDPOINT, params: params ?? buildSearchCriteria() });
        if (resultInscriptions.successData) {
            setDataSource(resultInscriptions.successData);
            setCollapseActiveKey([]); // réduire le collapse et mettre en évidence les résultats (sur mobile)
        }
    };

    const onConfirmSuppression = async () => {
        setModaleConfirmSuppressionOpen(false);
        const result = await execute<number[]>({ method: "DELETE", url: INSCRIPTION_ENDPOINT, data: getSelectedInscriptionDistinctIds() });
        if (result.success) {
            notification.open({ message: "Les modifications ont bien été prises en compte", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedInscriptions([]);
            loadInscriptions();
        }
    }

    const getSelectedInscriptionDistinctIds = () => {
        return Array.from(new Set(selectedInscriptions.map(inscription => inscription.idInscription)));
    }

    const DropdownMenu = () => {
        const handleMenuClick = async (e: any) => {
            if (selectedInscriptions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) { // Consultation/Modification d'inscription
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                navigate(path, { state: { isReadOnly: readOnly, id: selectedInscriptions[0].idInscription, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { // Validation d'inscriptions
                const inscriptionsPatch: InscriptionPatchDto[] = getSelectedInscriptionDistinctIds().map(id => ({ id, statut: StatutInscription.VALIDEE }));
                const resultValidationInscriptions = await execute({ method: "PATCH", url: INSCRIPTION_ENDPOINT, data: { inscriptions: inscriptionsPatch } });
                if (resultValidationInscriptions.success) {
                    notification.open({ message: "Les modifications ont bien été prises en compte", type: "success" });
                    setSelectedInscriptions([]);
                    loadInscriptions();
                }
            } else if (e.key === SUPPRIMER_MENU_KEY) { // Suppression d'inscriptions
                setModaleConfirmSuppressionOpen(true);
            }
        };

        const desktopActions: MenuProps['items'] = [{ label: <><EyeTwoTone className="action-icon" />Consulter</>, key: CONSULTER_MENU_KEY, disabled: selectedInscriptions.length !== 1 },
        { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedInscriptions.length !== 1 }];

        const commonActions: MenuProps['items'] = [{ label: <><CheckCircleTwoTone className="action-icon" />Valider</>, key: VALIDER_MENU_KEY, disabled: selectedInscriptions.length < 1 },
        { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedInscriptions.length < 1 }];

        const items: MenuProps['items'] = isMobile ? [...commonActions] : [...desktopActions, ...commonActions];

        const menu: MenuProps = { items, onClick: handleMenuClick };

        return (
            <Dropdown menu={menu}>
                <Button>
                    Actions <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    function buildSearchCriteria() {
        const { nom, prenom, telephone, statut, noInscription, idPeriode } = form.getFieldsValue();
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dayjs(dateInscription).format(APPLICATION_DATE_FORMAT);
        }
        const niveaux = form.getFieldValue("niveau");
        const niveauxInternes = form.getFieldValue("niveauInterne");
        const type = application === "COURS_ENFANT" ? "ENFANT" : "ADULTE";
        const searchCriteria = {
            nom: nom ?? null, prenom: prenom ?? null, telephone: telephone ?? null,
            statut: statut ?? null, dateInscription: dateInscription ?? null, niveaux: niveaux ?? null,
            niveauxInternes: niveauxInternes ?? null, noInscription: noInscription ?? null, idPeriode: idPeriode ?? null,
            type
        }
        return searchCriteria;
    }

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
    }

    const SearchFilters: FunctionComponent = () => {
        return (
            <AdminSearchFilter doSearch={() => loadInscriptions()} inputFilters={getSearchFilters()} />
        );
    };

    const SearchFiltersNoCard: FunctionComponent = () => {
        const allFilters = getSearchFilters();
        // Sur mobile, on garde uniquement les filtres essentiels
        const mobileFilterNames = ['idPeriode', 'prenom', 'nom', 'noInscription', 'statut'];
        const filters = allFilters.filter(f => mobileFilterNames.includes(f.name));
        
        return (
            <div>
                {filters.map(filter => {
                    let inputElement;
                    
                    if (filter.inputType === "InputText") {
                        inputElement = <Input placeholder={filter.libelle} onPressEnter={() => loadInscriptions()} />;
                    } else if (filter.inputType === "InputNumber") {
                        inputElement = <InputNumber placeholder={filter.libelle} style={{ width: '100%' }} onPressEnter={() => loadInscriptions()} />;
                    } else if (filter.inputType === "Date") {
                        inputElement = <DatePicker placeholder={filter.libelle} style={{ width: '100%' }} onChange={() => loadInscriptions()} />;
                    } else if (filter.inputType === "Select" && 'selectOptions' in filter) {
                        inputElement = <Select placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
                    } else if (filter.inputType === "SelectTags" && 'selectOptions' in filter) {
                        inputElement = <Select mode="multiple" placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
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
                    <Button icon={<SearchOutlined />} onClick={() => loadInscriptions()} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
                </div>
            </div>
        );
    };

    const filterCollapseItems: any[] = [
        {
            key: '1',
            label: <span><SearchOutlined /> Filtres de recherche</span>,
            children: <SearchFiltersNoCard />
        }
    ];

    const MobileInscriptionCard = ({ inscription }: { inscription: InscriptionLight }) => {
        const isSelected = selectedInscriptions.some(i => i.id === inscription.id);
        
        const handleCardClick = () => {
            if (isSelected) {
                setSelectedInscriptions(selectedInscriptions.filter(i => i.id !== inscription.id));
            } else {
                setSelectedInscriptions([...selectedInscriptions, inscription]);
            }
        };

        const getStatutTag = () => {
            if (inscription.statut === StatutInscription.VALIDEE) {
                return <Tag color="green">Validée</Tag>;
            } else if (inscription.statut === StatutInscription.PROVISOIRE) {
                return <Tag color="orange">À valider</Tag>;
            } else if (inscription.statut === StatutInscription.LISTE_ATTENTE) {
                return <Tag color="red">Liste d'attente</Tag>;
            } else {
                return <Tag color="red">Refusée</Tag>;
            }
        };

        return (
            <Card className="adhesion-card-mobile" size="small">
                <div className="adhesion-card-header">
                    <div className="adhesion-card-name">
                        {inscription.prenom} {inscription.nom}
                    </div>
                    <Checkbox checked={isSelected} onChange={handleCardClick} />
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">N° inscription:</span>
                    <span className="adhesion-card-value">{inscription.noInscription}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Niveau interne:</span>
                    <span className="adhesion-card-value">{inscription.niveauInterne}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Téléphone:</span>
                    <span className="adhesion-card-value">{inscription.mobile}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Statut:</span>
                    <span className="adhesion-card-value">{getStatutTag()}</span>
                </div>
                <div className="adhesion-card-row">
                    <span className="adhesion-card-label">Date:</span>
                    <span className="adhesion-card-value">
                        {dayjs(inscription.dateInscription, APPLICATION_DATE_TIME_FORMAT).format(APPLICATION_DATE_FORMAT)}
                    </span>
                </div>
                <div className="adhesion-card-actions">
                    <Button size="small" type="primary" onClick={() => {
                        const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                        navigate(path, { state: { isReadOnly: true, id: inscription.idInscription, isAdmin: true } });
                    }}>
                        <EyeTwoTone /> Consulter
                    </Button>
                    <Button size="small" onClick={() => {
                        const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                        navigate(path, { state: { isReadOnly: false, id: inscription.idInscription, isAdmin: true } });
                    }}>
                        <EditTwoTone /> Modifier
                    </Button>
                </div>
            </Card>
        );
    };

    useEffect(() => {
        const loadPeriodes = async () => {
            const resultPeriodes = await execute<PeriodeInfoDto[]>({ method: "GET", url: PERIODES_ENDPOINT, params: { application } });
            if (resultPeriodes.success && resultPeriodes.successData && resultPeriodes.successData?.length > 0) {
                const periodes = resultPeriodes.successData;
                setPeriodesOptions(getPeriodeOptions(periodes));
                form.setFieldValue("idPeriode", periodes[0].id);
                loadInscriptions({ type, idPeriode: periodes[0].id });
            }
        }
        loadPeriodes();
    }, [type]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: InscriptionLight[]) => {
            setSelectedInscriptions(selectedRows);
        }
    };

    const isInscriptionsSelected = () => {
        return dataSource && dataSource.length > 0;
    };

    const renderPdf = (idInscription: number) => {
        return type === "ENFANT" ? inscriptionsEnfantsById[idInscription] !== undefined
            : inscriptionsAdultesById[idInscription] !== undefined;
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
    }

    async function loadInscription(id: number) {
        if (type === "ENFANT") {
            const resultInscription = await execute<InscriptionEnfantBack>({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }) });
            if (resultInscription.success && resultInscription.successData) {
                setInscriptionsEnfantsById({ ...inscriptionsEnfantsById, [id]: resultInscription.successData });
            }
        } else {
            const resultInscription = await execute<InscriptionAdulteBack>({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id }) });
            if (resultInscription.success && resultInscription.successData) {
                setInscriptionsAdultesById({ ...inscriptionsAdultesById, [id]: resultInscription.successData });
            }
        }
    }

    const getPdf = (record: InscriptionLight) => {
        return renderPdf(record.idInscription) ? (<PDFDownloadLink document={getDocumentContent(record.idInscription)} fileName={getFileNameInscription(record)}>
            {({ blob, url, loading, error }) => {
                return loading ? "Génération Pdf..." : <FilePdfTwoTone />
            }
            }
        </PDFDownloadLink>) : (<Button type="primary" onClick={() => { loadInscription(record.idInscription) }}>Générer Pdf</Button>)
    }

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
            title: "Fichier Pdf",
            key: "pdf",
            render: (value, record, index) => getPdf(record),
        },
    ];

    const getNbDistinctsInscription = () => {
        return new Set(dataSource?.map(inscription => inscription.idInscription)).size;
    }

    const formatTotal = (total: number) => {
        if (total > 0) {
            return (<Tag color="geekblue">Total sélection : <strong>{total} élève(s)</strong> (<strong>{getNbDistinctsInscription()} inscription(s)</strong>)</Tag>);
        } else {
            return (<Tag color="geekblue">Total sélection : <strong>{total}</strong></Tag>);
        }
    }

    return roles?.includes("ROLE_ADMIN") ? (
        <div className="centered-content">
            <Form
                name="adminCours"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                autoComplete="off"
                className="container-full-width"
                form={form}
            >
                <Spin spinning={isLoading}>
                    <h2 className={type === "ENFANT" ? "insc-enfant-title" : "insc-adulte-title"}>
                        {icon} Administration des inscriptions {type === "ENFANT" ? "enfant" : "adulte"}
                    </h2>
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
                                                .map(inscription => (
                                                    <MobileInscriptionCard key={inscription.id} inscription={inscription} />
                                                ))}
                                            <div className="mobile-pagination">
                                                <Pagination
                                                    current={currentMobilePage}
                                                    pageSize={mobilePageSize}
                                                    total={dataSource.length}
                                                    onChange={(page) => setCurrentMobilePage(page)}
                                                    showSizeChanger={false}
                                                    showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total}`}
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
                                            <Tooltip color="geekblue" title="Exporter le resultat de la recherche dans un fichier Excel">
                                                <Button icon={<FileExcelOutlined />} onClick={exportData} disabled={!isInscriptionsSelected()} type="primary">
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
                                )}
                            </div>
                        ) : (
                            <div className="no-results">
                                Aucune inscription trouvée
                            </div>
                        )}
                    </div>

                    <ModaleConfirmSuppressionInscription 
                        open={modaleConfirmSuppressionOpen} 
                        setOpen={setModaleConfirmSuppressionOpen}
                        nbInscriptions={getSelectedInscriptionDistinctIds().length} 
                        onConfirm={onConfirmSuppression} 
                    />
                </Spin>
            </Form>
        </div>
    ) : <UnahtorizedAccess />
};