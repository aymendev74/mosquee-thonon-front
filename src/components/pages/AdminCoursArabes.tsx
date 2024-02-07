import { FunctionComponent, useEffect, useState } from "react";
import { Inscription, InscriptionForExport, InscriptionLight, NiveauScolaire, StatutInscription } from "../../services/inscription";
import { INSCRIPTION_ENDPOINT, VALIDATION_INSCRIPTION_ENDPOINT } from "../../services/services";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Table from "antd/es/table";
import { Button, Col, Collapse, DatePicker, Dropdown, Form, Input, MenuProps, Row, Select, Spin, Tooltip, notification } from "antd";
import { CheckCircleTwoTone, ClockCircleOutlined, DeleteTwoTone, DownOutlined, EditTwoTone, EyeTwoTone, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import { columnsTableInscriptions } from "../common/tableDefinition";
import { ModaleDerniersInscription } from "../modals/ModalDernieresInscriptions";
import { ModaleConfirmSuppression } from "../modals/ModalConfirmSuppression";
import * as XLSX from 'xlsx';
import moment from "moment";
import { getNiveauOptions } from "../common/commoninputs";
import { InputFormItem } from "../common/InputFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";

export const AdminCoursArabes: FunctionComponent = () => {

    const [dataSource, setDataSource] = useState<InscriptionLight[]>();
    const { loggedUser } = useAuth();
    const navigate = useNavigate();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const { Panel } = Collapse;
    const [form] = Form.useForm();
    const [selectedInscriptions, setSelectedInscriptions] = useState<InscriptionLight[]>([]);
    const [modaleDernieresInscriptionOpen, setModaleDernieresInscriptionOpen] = useState<boolean>(false);
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);

    const CONSULTER_MENU_KEY = "1";
    const MODIFIER_MENU_KEY = "2";
    const VALIDER_MENU_KEY = "3";
    const SUPPRIMER_MENU_KEY = "4";

    const prepareForExport = (dataSource: InscriptionLight) => {
        const { id, idInscription, ...rest } = dataSource;
        return rest as InscriptionForExport;
    }

    const exportData = () => {
        // Crée une feuille de calcul
        if (dataSource) {
            const inscriptionForExports: InscriptionForExport[] = [];
            // On ne garde que les champs intéressants pour l'export excel
            dataSource.forEach(inscription => {
                inscriptionForExports.push(prepareForExport(inscription));
            });

            const ws = XLSX.utils.json_to_sheet(inscriptionForExports);

            // Crée un classeur
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Inscriptions');

            // Sauvegarde le fichier Excel
            XLSX.writeFile(wb, 'inscriptions.xlsx');
        }
    }

    const onConfirmSuppression = () => {
        setModaleConfirmSuppressionOpen(false);
        setApiCallDefinition({ method: "DELETE", url: INSCRIPTION_ENDPOINT, data: selectedInscriptions.map(inscription => inscription.id) });
    }

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedInscriptions.length === 1 && [CONSULTER_MENU_KEY, MODIFIER_MENU_KEY].includes(e.key)) { // Consultation/Modification d'inscription
                let readOnly: boolean = false;
                if (e.key === CONSULTER_MENU_KEY) {
                    readOnly = true;
                }
                navigate("/cours", { state: { isReadOnly: readOnly, id: selectedInscriptions[0].idInscription, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { // Validation d'inscriptions
                setApiCallDefinition({ method: "POST", url: VALIDATION_INSCRIPTION_ENDPOINT, data: selectedInscriptions.map(inscription => inscription.idInscription) });
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
        const nom = form.getFieldValue("nom");
        const prenom = form.getFieldValue("prenom");
        const telephone = form.getFieldValue("telephone");
        const statut = form.getFieldValue("statut");
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dateInscription.format(APPLICATION_DATE_FORMAT);
        }
        const niveaux = form.getFieldValue("niveau");
        const searchCriteria = {
            nom: nom ?? null, prenom: prenom ?? null, telephone: telephone ?? null,
            statut: statut ?? null, dateInscription: dateInscription ?? null, niveaux: niveaux ?? null
        }
        setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: searchCriteria });
    }

    const SearchCollapse = () => {
        return (
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Filtres de recherche" key="1">
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <InputFormItem name="prenom" label="Prénom" placeholder="Prénom" />
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <InputFormItem name="nom" label="Nom" placeholder="Nom" />
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <SelectFormItem name="niveau" label="Niveau scolaire" mode="tags" options={getNiveauOptions()} />
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <InputFormItem name="telephone" label="Téléphone" placeholder="Téléphone" />
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Tooltip title="Rechercher les inscription reçues à partir du" color="geekblue" key="dateInscription" >
                                <DatePickerFormItem name="dateInscription" label="Date inscription" placeholder="Date inscription" />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <SelectFormItem name="statut" label="Statut" placeholder="Statut" options={[
                                { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                { value: StatutInscription.VALIDEE, label: "Validée" }
                            ]} allowClear />
                        </Col>
                    </Row>
                    <div className="centered-content">
                        <Button icon={<SearchOutlined />} onClick={doSearch} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
                        <Tooltip title="Dernières inscriptions">
                            <Button icon={<ClockCircleOutlined />} shape="circle" onClick={() => { setModaleDernieresInscriptionOpen(true) }} />
                        </Tooltip>
                    </div>
                </Panel>
            </Collapse>
        );
    };

    useEffect(() => {
        const fetchInscriptions = async () => {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT });
        }
        fetchInscriptions();
    }, []);

    useEffect(() => {
        if (apiCallDefinition?.url === INSCRIPTION_ENDPOINT && apiCallDefinition.method === "GET" && result) {
            setDataSource(result);
            resetApi();
        }
        if (apiCallDefinition?.url === VALIDATION_INSCRIPTION_ENDPOINT && result) {
            notification.open({ message: "Les " + (result as number[]).length + " inscriptions sélectionnées ont été validées", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedInscriptions([]);
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT });
        }
        if (apiCallDefinition?.url === INSCRIPTION_ENDPOINT && apiCallDefinition.method === "DELETE" && result) {
            notification.open({ message: "Les " + (result as number[]).length + " inscriptions sélectionnées ont été supprimées", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedInscriptions([]);
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT });
        }
    }, [result]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: InscriptionLight[]) => {
            setSelectedInscriptions(selectedRows);
        }
    };

    const isInscriptionsSelected = () => {
        return dataSource && dataSource.length > 0;
    }

    return loggedUser ? (
        <Form
            name="adminCours"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
            className="container-full-width"
            form={form}
        >
            <Spin spinning={isLoading}>
                <h2>Administration des inscriptions aux cours</h2>
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
                                    columns={columnsTableInscriptions} dataSource={dataSource} rowKey={record => record.id} />
                            </Col>
                        </Row>
                    </div>
                </div>
                <ModaleDerniersInscription open={modaleDernieresInscriptionOpen} setOpen={setModaleDernieresInscriptionOpen} />
                <ModaleConfirmSuppression open={modaleConfirmSuppressionOpen} setOpen={setModaleConfirmSuppressionOpen}
                    nbInscriptions={selectedInscriptions.length} onConfirm={onConfirmSuppression} />
            </Spin>
        </Form>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>
};