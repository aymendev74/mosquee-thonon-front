import { FunctionComponent, useEffect, useState } from "react";
import { Inscription, InscriptionForExport, InscriptionLight, StatutInscription } from "../../services/inscription";
import { INSCRIPTION_ENDPOINT, VALIDATION_ENDPOINT } from "../../services/services";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Table from "antd/es/table";
import { Button, Col, Collapse, DatePicker, Dropdown, Form, Input, MenuProps, Row, Select, Spin, Tooltip, notification } from "antd";
import { ClockCircleOutlined, DownOutlined } from "@ant-design/icons";
import { columnsTableInscriptions } from "../common/tableDefinition";
import { ModaleDerniersInscription } from "../modals/ModalDernieresInscriptions";
import { ModaleConfirmSuppression } from "../modals/ModalConfirmSuppression";
import * as XLSX from 'xlsx';
import moment from "moment";
import { getNiveauOptions } from "../common/commoninputs";

export const Administration: FunctionComponent = () => {

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
                navigate("/inscription", { state: { isReadOnly: readOnly, id: selectedInscriptions[0].id, isAdmin: true } })
            } else if (e.key === VALIDER_MENU_KEY) { // Validation d'inscriptions
                setApiCallDefinition({ method: "POST", url: VALIDATION_ENDPOINT, data: selectedInscriptions.map(inscription => inscription.id) });
            } else if (e.key === SUPPRIMER_MENU_KEY) { // Suppression d'inscriptions
                setModaleConfirmSuppressionOpen(true);
            }
        };

        const items: MenuProps['items'] = [{ label: "Consulter", key: CONSULTER_MENU_KEY, disabled: selectedInscriptions.length !== 1 },
        { label: "Modifier", key: MODIFIER_MENU_KEY, disabled: selectedInscriptions.length !== 1 },
        { label: "Valider inscription", key: VALIDER_MENU_KEY, disabled: selectedInscriptions.length < 1 },
        { label: "Supprimer", danger: true, key: SUPPRIMER_MENU_KEY, disabled: selectedInscriptions.length < 1 }];

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
            console.log(dateInscription);
            dateInscription = dateInscription.format("DD.MM.YYYY");
            console.log(dateInscription);
        }
        const niveau = form.getFieldValue("niveau");
        const searchCriteria = {
            nom: nom ?? null, prenom: prenom ?? null, telephone: telephone ?? null,
            statut: statut ?? null, dateInscription: dateInscription ?? null, niveau: niveau ?? null
        }
        setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: searchCriteria });
    }

    const SearchCollapse = () => {
        return (
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Filtres de recherche" key="1">
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="prenom" label="Prénom">
                                <Input placeholder="Prénom" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="nom" label="Nom">
                                <Input placeholder="Nom" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="niveau" label="Niveau scolaire">
                                <Select options={getNiveauOptions()} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="telephone" label="Téléphone">
                                <Input placeholder="Téléphone" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="dateInscription" label="Date inscription">
                                <DatePicker placeholder="Date inscription" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="statut" label="Statut">
                                <Select placeholder="Statut" options={[
                                    { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                    { value: StatutInscription.VALIDEE, label: "Validée" }
                                ]} allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className="centered-content">
                        <Button onClick={doSearch} style={{ marginRight: "10px" }}>Rechercher</Button>
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
        if (apiCallDefinition?.url === VALIDATION_ENDPOINT && result) {
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
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
            className="container-full-width"
            form={form}
        >
            <Spin spinning={isLoading}>
                <div className="d-flex">
                    <div className="filters-container">
                        <SearchCollapse />
                    </div>
                    <div className="result-container">
                        <div className="menu-action-container">
                            <div className="label">Veuillez choisir une action à effectuer :</div>
                            <div className="bt-action"><DropdownMenu /></div>
                            <Button onClick={exportData} disabled={!isInscriptionsSelected()}>Exporter</Button>
                        </div>
                        <Row>
                            <Col span={24}>
                                <Table rowSelection={{ type: "checkbox", selectedRowKeys: selectedInscriptions.map(inscription => inscription.id), ...rowSelection }}
                                    columns={columnsTableInscriptions} dataSource={dataSource} rowKey={record => record.id} />
                            </Col>
                        </Row>
                        {selectedInscriptions && selectedInscriptions.length > 0 && (<Row>
                            <Col span={24}>
                                <Button onClick={exportData}>Exporter</Button>
                            </Col>
                        </Row>)}
                    </div>
                </div>
                <ModaleDerniersInscription open={modaleDernieresInscriptionOpen} setOpen={setModaleDernieresInscriptionOpen} />
                <ModaleConfirmSuppression open={modaleConfirmSuppressionOpen} setOpen={setModaleConfirmSuppressionOpen}
                    nbInscriptions={selectedInscriptions.length} onConfirm={onConfirmSuppression} />
            </Spin>
        </Form>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>
};