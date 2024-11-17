import { FunctionComponent, useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { AdhesionLight, AdhesionLightForExport } from "../../../services/adhesion";
import { useNavigate } from "react-router-dom";
import { Button, Col, Collapse, Dropdown, Form, MenuProps, Row, Spin, Table, Tag, Tooltip, notification } from "antd";
import { ADHESION_ENDPOINT, ADHESION_SEARCH_ENDPOINT, ApiCallbacks, handleApiCall } from "../../../services/services";
import { CheckCircleTwoTone, DeleteTwoTone, DownOutlined, EditTwoTone, EuroCircleOutlined, EyeTwoTone, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone, SearchOutlined } from "@ant-design/icons";
import { StatutInscription } from "../../../services/inscription";
import { getFileNameAdhesion } from "../../common/tableDefinition";
import { ModaleConfirmSuppression } from "../../modals/ModalConfirmSuppression";
import useApi from "../../../hooks/useApi";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../utils/FormUtils";
import { PdfAdhesion } from "../../documents/PdfAdhesion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { AdminSearchFilter } from "../../common/AdminSearchFilter";
import { useAuth } from "../../../hooks/AuthContext";


export const AdminAdhesion: FunctionComponent = () => {

    const [dataSource, setDataSource] = useState<AdhesionLight[]>();
    const { getRoles } = useAuth();
    const navigate = useNavigate();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const { Panel } = Collapse;
    const [form] = Form.useForm();
    const [selectedAdhesions, setSelectedAdhesions] = useState<AdhesionLight[]>([]);
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);
    const [renderedPdfAdhesionIds, setRenderedPdfAdhesionsIds] = useState<number[]>([]);

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";

    const prepareForExport = (dataSource: AdhesionLight) => {
        const { id, ...rest } = dataSource;
        return rest as AdhesionLightForExport;
    }

    const exportData = () => {
        // Crée une feuille de calcul
        if (dataSource) {
            const inscriptionForExports: AdhesionLightForExport[] = [];
            // On ne garde que les champs intéressants pour l'export excel
            dataSource.forEach(adhesion => {
                inscriptionForExports.push(prepareForExport(adhesion));
            });

            const ws = XLSX.utils.json_to_sheet(inscriptionForExports);

            // Crée un classeur
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Adhésions');

            // Sauvegarde le fichier Excel
            XLSX.writeFile(wb, 'adhesions.xlsx');
        }
    }

    const onConfirmSuppression = () => {
        setModaleConfirmSuppressionOpen(false);
        setApiCallDefinition({ method: "DELETE", url: ADHESION_ENDPOINT, data: selectedAdhesions.map(adhesion => adhesion.id) });
    }

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedAdhesions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) { // Consultation/Modification d'inscription
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                navigate("/adhesion", { state: { isReadOnly: readOnly, id: selectedAdhesions[0].id, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { // Validation d'inscriptions
                setApiCallDefinition({ method: "PATCH", url: ADHESION_SEARCH_ENDPOINT, data: { ids: selectedAdhesions.map(adhesion => adhesion.id), statut: StatutInscription.VALIDEE } });
            } else if (e.key === SUPPRIMER_MENU_KEY) { // Suppression d'inscriptions
                setModaleConfirmSuppressionOpen(true);
            }
        };

        const items: MenuProps['items'] = [{ label: <><EyeTwoTone className="action-icon" />Consulter</>, key: CONSULTER_MENU_KEY, disabled: selectedAdhesions.length !== 1 },
        { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedAdhesions.length !== 1 },
        { label: <><CheckCircleTwoTone className="action-icon" />Valider adhésion</>, key: VALIDER_MENU_KEY, disabled: selectedAdhesions.length < 1 },
        { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedAdhesions.length < 1 }];

        const menu: MenuProps = { items, onClick: handleMenuClick };

        return (
            <Dropdown menu={menu}>
                <Button>
                    Actions <DownOutlined />
                </Button>
            </Dropdown>
        );
    };

    const doSearch = () => {
        const { nom, prenom, statut, montant } = form.getFieldsValue();
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dateInscription.format(APPLICATION_DATE_FORMAT);
        }
        const searchCriteria = {
            nom: nom ?? null, prenom: prenom ?? null, statut: statut ?? null,
            dateInscription: dateInscription ?? null, montant: montant ?? null
        }
        setApiCallDefinition({ method: "GET", url: ADHESION_SEARCH_ENDPOINT, params: searchCriteria });
    }

    const SearchCollapse = () => {
        return (
            <AdminSearchFilter doSearch={doSearch} inputFilters={[
                { name: "prenom", libelle: "Prénom", inputType: "InputText" },
                { name: "nom", libelle: "Nom", inputType: "InputText" },
                { name: "montant", libelle: "Montant", inputType: "InputNumber", tooltip: "Rechercher les ahdésions dont le montant est supérieur à" },
                { name: "dateInscription", libelle: "Date adhésion", inputType: "Date", tooltip: "Rechercher les ahdésions reçues à partir du" },
                {
                    name: "statut", libelle: "Statut", inputType: "Select", selectOptions: [
                        { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                        { value: StatutInscription.VALIDEE, label: "Validée" }
                    ]
                },
            ]} />
        );
    };

    useEffect(() => {
        const fetchAdhesions = async () => {
            setApiCallDefinition({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
        }
        fetchAdhesions();
    }, []);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${ADHESION_SEARCH_ENDPOINT}`]: (result: any) => {
            setDataSource(result);
            resetApi();
        },
        [`PATCH:${ADHESION_SEARCH_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les " + (result as number[]).length + " adhésions sélectionnées ont été validées", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedAdhesions([]);
            setApiCallDefinition({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
        },
        [`DELETE:${ADHESION_SEARCH_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les " + (result as number[]).length + " adhésions sélectionnées ont été supprimées", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedAdhesions([]);
            setApiCallDefinition({ method: "GET", url: ADHESION_SEARCH_ENDPOINT });
        }
    };

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

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
            title: "Fichier Pdf",
            key: "pdf",
            render: (value, record, index) => renderPdf(record.id) ? (<PDFDownloadLink document={<PdfAdhesion id={record.id} />} fileName={getFileNameAdhesion(record)}>
                {({ blob, url, loading, error }) => {
                    return loading ? "Génération Pdf..." : <FilePdfTwoTone />
                }
                }
            </PDFDownloadLink>) : <Button type="primary" onClick={() => setRenderedPdfAdhesionsIds([...renderedPdfAdhesionIds, record.id])}>Générer Pdf</Button>
        },
    ]

    const formatTotal = (total: number) => {
        if (total > 0) {
            return (<Tag color="geekblue">Total sélection : <strong>{total} adhésion(s)</strong></Tag>);
        } else {
            return (<Tag color="geekblue">Total sélection : <strong>{total}</strong></Tag>);
        }
    }

    return getRoles()?.includes("ROLE_ADMIN") ? (
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
                    <div className="d-flex">
                        <div className="filters-container">
                            <SearchCollapse />
                        </div>
                        <div className="result-container">
                            <div className="menu-action-container">
                                <div className="label">Veuillez choisir une action à effectuer :</div>
                                <div className="bt-action"><DropdownMenu /></div>
                                <Tooltip color="geekblue" title="Exporter le resultat de la recherche dans un fichier Excel">
                                    <Button icon={<FileExcelOutlined />} onClick={exportData} disabled={!isInscriptionsSelected()} type="primary">Exporter</Button>
                                </Tooltip>
                            </div>
                            <Row>
                                <Col span={24}>
                                    <Table rowSelection={{ type: "checkbox", selectedRowKeys: selectedAdhesions.map(adhesion => adhesion.id), ...rowSelection }}
                                        columns={columnsTableAdhesions} dataSource={dataSource} rowKey={record => record.id}
                                        pagination={{ showTotal: formatTotal }} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <ModaleConfirmSuppression open={modaleConfirmSuppressionOpen} setOpen={setModaleConfirmSuppressionOpen}
                        nbInscriptions={selectedAdhesions.length} onConfirm={onConfirmSuppression} />
                </Spin>
            </Form>
        </div>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>
};