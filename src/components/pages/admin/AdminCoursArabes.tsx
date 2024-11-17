import { FunctionComponent, useEffect, useState } from "react";
import { InscriptionAdulteBack, InscriptionEnfantBack, InscriptionLight, InscriptionPatchDto, StatutInscription } from "../../../services/inscription";
import { ApiCallbacks, buildUrlWithParams, handleApiCall, INSCRIPTION_ADULTE_ENDPOINT, INSCRIPTION_ENDPOINT, INSCRIPTION_ENFANT_ENDPOINT, PERIODES_ENDPOINT } from "../../../services/services";
import { useLocation, useNavigate } from "react-router-dom";
import useApi from "../../../hooks/useApi";
import Table, { ColumnsType } from "antd/es/table";
import { Button, Col, Collapse, Dropdown, Form, MenuProps, Row, Spin, Tag, Tooltip, notification } from "antd";
import { CheckCircleTwoTone, DeleteTwoTone, DownOutlined, EditTwoTone, EyeTwoTone, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone, StopOutlined, TeamOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";
import { ModaleConfirmSuppression } from "../../modals/ModalConfirmSuppression";
import * as XLSX from 'xlsx';
import { getLibelleNiveauScolaire, getNiveauInterneAdulteOptions, getNiveauInterneEnfantOptions, getNiveauOptions, getStatutInscriptionOptions } from "../../common/commoninputs";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../utils/FormUtils";
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

export const AdminCoursArabes: FunctionComponent = () => {

    const location = useLocation();
    const application = location.state?.application; // ADULTE ou ENFANT
    const type = application === "COURS_ADULTE" ? "ADULTE" : "ENFANT";
    const [dataSource, setDataSource] = useState<InscriptionLight[]>();
    const { getRoles } = useAuth();
    const navigate = useNavigate();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [form] = Form.useForm();
    const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionLight[]>([]);
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [inscriptionsEnfantsById, setInscriptionsEnfantsById] = useState<Record<number, InscriptionEnfantBack>>({});
    const [inscriptionsAdultesById, setInscriptionsAdultesById] = useState<Record<number, InscriptionAdulteBack>>({});
    const [loadingInscriptionId, setLoadingInscriptionId] = useState<number>();

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";
    const icon = type === "ENFANT" ? <TeamOutlined /> : <UserOutlined />;

    type ColumnHeadersType = Partial<Record<keyof InscriptionLight, string>>;

    const prepareForExport = (dataSource: any) => {
        // Mapping des champs de l'objet aux noms des colonnes du fichier excel
        let columnHeaders: ColumnHeadersType = { // commun aux cours adultes et enfant
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
            columnHeaders = {
                ...columnHeaders,
                niveau: "Niveau publique",
                nomResponsableLegal: "Nom responsable légal",
                prenomResponsableLegal: "Prénom responsable légal",
                nomContactUrgence: "Nom autre contact",
                prenomContactUrgence: "Prénom autre contact",
                mobileContactUrgence: "Tél. autre contact",
                autorisationAutonomie: "Autorisation à rentrer seul",
                autorisationMedia: "Autorisation photos/vidéos",
            }
        }

        const transformValue = (key: keyof InscriptionLight, value: any): string => {
            if (typeof value === 'boolean') {
                return value ? 'OUI' : 'NON';
            }
            return value;
        };

        return dataSource.map((row: any) => {
            const formattedRow: { [key: string]: string } = {};
            for (const key in columnHeaders) {
                const typedKey = key as keyof InscriptionLight;
                formattedRow[columnHeaders[typedKey] as string] = transformValue(typedKey, row[typedKey]);
            }
            return formattedRow;
        });
    }

    const exportData = () => {
        if (dataSource) {
            const formattedData = prepareForExport(dataSource);

            const ws = XLSX.utils.json_to_sheet(formattedData);

            // Crée un classeur
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Inscriptions');

            // Sauvegarde le fichier Excel
            XLSX.writeFile(wb, 'inscriptions.xlsx');
        }
    }

    const onConfirmSuppression = () => {
        setModaleConfirmSuppressionOpen(false);
        setApiCallDefinition({ method: "DELETE", url: INSCRIPTION_ENDPOINT, data: getSelectedInscriptionDistinctIds() });
    }

    const getSelectedInscriptionDistinctIds = () => {
        return Array.from(new Set(selectedInscriptions.map(inscription => inscription.idInscription)));
    }

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedInscriptions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) { // Consultation/Modification d'inscription
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                navigate(path, { state: { isReadOnly: readOnly, id: selectedInscriptions[0].idInscription, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { // Validation d'inscriptions
                const patchInscription: InscriptionPatchDto = { ids: getSelectedInscriptionDistinctIds(), statut: StatutInscription.VALIDEE };
                setApiCallDefinition({ method: "PATCH", url: INSCRIPTION_ENDPOINT, data: patchInscription });
            } else if (e.key === SUPPRIMER_MENU_KEY) { // Suppression d'inscriptions
                setModaleConfirmSuppressionOpen(true);
            }
        };

        const items: MenuProps['items'] = [{ label: <><EyeTwoTone className="action-icon" />Consulter</>, key: CONSULTER_MENU_KEY, disabled: selectedInscriptions.length !== 1 },
        { label: <><EditTwoTone className="action-icon" />Modifier</>, key: MODIFIER_MENU_KEY, disabled: selectedInscriptions.length !== 1 },
        { label: <><CheckCircleTwoTone className="action-icon" />Valider inscription</>, key: VALIDER_MENU_KEY, disabled: selectedInscriptions.length < 1 },
        { label: <><DeleteTwoTone className="action-icon" />Supprimer</>, danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedInscriptions.length < 1 }];

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
        setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: searchCriteria });
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

    const SearchCollapse: FunctionComponent = () => {
        return (
            <AdminSearchFilter doSearch={doSearch} inputFilters={getSearchFilters()} />
        );
    };

    useEffect(() => {
        setApiCallDefinition({ method: "GET", url: PERIODES_ENDPOINT, params: { application } });
    }, [type]);

    const apiCallbacks: ApiCallbacks = {
        [`GET:${INSCRIPTION_ENDPOINT}`]: (result: any) => {
            setDataSource(result);
            resetApi();
        },
        [`PATCH:${INSCRIPTION_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les modifications ont bien été prises en compte", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedInscriptions([]);
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: { type } });
        },
        [`DELETE:${INSCRIPTION_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "Les modifications ont bien été prises en compte", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedInscriptions([]);
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: { type } });
        },
        [`GET:${PERIODES_ENDPOINT}`]: (result: any) => {
            setPeriodesOptions(getPeriodeOptions(result as PeriodeInfoDto[]));
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: { type } });
        },
        [`GET:${INSCRIPTION_ENFANT_ENDPOINT}`]: (result: any) => {
            setInscriptionsEnfantsById({ ...inscriptionsEnfantsById, [loadingInscriptionId!]: result });
            setLoadingInscriptionId(undefined);
        },
        [`GET:${INSCRIPTION_ADULTE_ENDPOINT}`]: (result: any) => {
            setInscriptionsAdultesById({ ...inscriptionsAdultesById, [loadingInscriptionId!]: result });
            setLoadingInscriptionId(undefined);
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
            return <PdfInscriptionCoursEnfant inscription={inscriptionsEnfantsById[idInscription]} />;
        } else {
            return <PdfInscriptionCoursArabeAdulte inscription={inscriptionsAdultesById[idInscription]} />;
        }
    }

    function loadInscription(id: number) {
        setLoadingInscriptionId(id);
        if (type === "ENFANT") {
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ENFANT_ENDPOINT, { id }) });
        } else {
            setApiCallDefinition({ method: "GET", url: buildUrlWithParams(INSCRIPTION_ADULTE_ENDPOINT, { id }) });
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

    return getRoles()?.includes("ROLE_ADMIN") ? (
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
                                    <Table rowSelection={{ type: "checkbox", selectedRowKeys: selectedInscriptions.map(inscription => inscription.id), ...rowSelection }}
                                        columns={columnsTableInscriptions} dataSource={dataSource} rowKey={record => record.id}
                                        pagination={{ showTotal: formatTotal }} />
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <ModaleConfirmSuppression open={modaleConfirmSuppressionOpen} setOpen={setModaleConfirmSuppressionOpen}
                        nbInscriptions={getSelectedInscriptionDistinctIds().length} onConfirm={onConfirmSuppression} />
                </Spin>
            </Form>
        </div>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>
};