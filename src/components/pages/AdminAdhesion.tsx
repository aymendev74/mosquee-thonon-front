import { FunctionComponent, useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { AdhesionLight, AdhesionLightForExport } from "../../services/adhesion";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import { Button, Col, Collapse, DatePicker, Dropdown, Form, Input, InputNumber, MenuProps, Row, Select, Spin, Table, Tooltip, notification } from "antd";
import { ADHESION_ENDPOINT, INSCRIPTION_ENDPOINT, VALIDATION_ADHESION_ENDPOINT } from "../../services/services";
import { CheckCircleTwoTone, DeleteTwoTone, DownOutlined, EditTwoTone, EyeTwoTone, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import { StatutInscription } from "../../services/inscription";
import { columnsTableAdhesions } from "../common/tableDefinition";
import { ModaleConfirmSuppression } from "../modals/ModalConfirmSuppression";
import useApi from "../../hooks/useApi";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { InputFormItem } from "../common/InputFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { SelectFormItem } from "../common/SelectFormItem";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";


export const AdminAdhesion: FunctionComponent = () => {

    const [dataSource, setDataSource] = useState<AdhesionLight[]>();
    const { loggedUser } = useAuth();
    const navigate = useNavigate();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const { Panel } = Collapse;
    const [form] = Form.useForm();
    const [selectedAdhesions, setSelectedAdhesions] = useState<AdhesionLight[]>([]);
    const [modaleDernieresInscriptionOpen, setModaleDernieresInscriptionOpen] = useState<boolean>(false);
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);

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
                setApiCallDefinition({ method: "POST", url: VALIDATION_ADHESION_ENDPOINT, data: selectedAdhesions.map(adhesion => adhesion.id) });
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
        const nom = form.getFieldValue("nom");
        const prenom = form.getFieldValue("prenom");
        const statut = form.getFieldValue("statut");
        const montant = form.getFieldValue("montant");
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dateInscription.format(APPLICATION_DATE_FORMAT);
        }
        const searchCriteria = {
            nom: nom ?? null, prenom: prenom ?? null, statut: statut ?? null,
            dateInscription: dateInscription ?? null, montant: montant ?? null
        }
        setApiCallDefinition({ method: "GET", url: ADHESION_ENDPOINT, params: searchCriteria });
    }

    const SearchCollapse = () => {
        return (
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Filtres de recherche" key="1">
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Tooltip title="Prénom de l'élève" color="geekblue" key="prenomEleve">
                                <InputFormItem name="prenom" label="Prénom" placeholder="Prénom" />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Tooltip title="Nom de l'élève" color="geekblue" key="nomEleve">
                                <InputFormItem name="nom" label="Nom" placeholder="Nom" />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Tooltip title="Rechercher les ahdésions dont le montant est supérieur à" color="geekblue" key="montantVersement">
                                <InputNumberFormItem name="montant" label="Montant" placeholder="Montant versement" />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Tooltip title="Rechercher les ahdésions reçues à partir du" color="geekblue" key="dateInscription" >
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
                    </div>
                </Panel>
            </Collapse>
        );
    };

    useEffect(() => {
        const fetchAdhesions = async () => {
            setApiCallDefinition({ method: "GET", url: ADHESION_ENDPOINT });
        }
        fetchAdhesions();
    }, []);

    useEffect(() => {
        if (apiCallDefinition?.url === ADHESION_ENDPOINT && apiCallDefinition.method === "GET" && result) {
            setDataSource(result);
            resetApi();
        }
        if (apiCallDefinition?.url === VALIDATION_ADHESION_ENDPOINT && result) {
            notification.open({ message: "Les " + (result as number[]).length + " adhésions sélectionnées ont été validées", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedAdhesions([]);
            setApiCallDefinition({ method: "GET", url: ADHESION_ENDPOINT });
        }
        if (apiCallDefinition?.url === ADHESION_ENDPOINT && apiCallDefinition.method === "DELETE" && result) {
            notification.open({ message: "Les " + (result as number[]).length + " adhésions sélectionnées ont été supprimées", type: "success" });
            // On reload toutes les inscriptions depuis la base
            setSelectedAdhesions([]);
            setApiCallDefinition({ method: "GET", url: ADHESION_ENDPOINT });
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

    return loggedUser ? (
        <Form
            name="adminAdhesion"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
            className="container-full-width"
            form={form}
        >
            <Spin spinning={isLoading}>
                <h2>Administration des adhésions</h2>
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
                                    columns={columnsTableAdhesions} dataSource={dataSource} rowKey={record => record.id} />
                            </Col>
                        </Row>
                    </div>
                </div>
                <ModaleConfirmSuppression open={modaleConfirmSuppressionOpen} setOpen={setModaleConfirmSuppressionOpen}
                    nbInscriptions={selectedAdhesions.length} onConfirm={onConfirmSuppression} />
            </Spin>
        </Form>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>
};