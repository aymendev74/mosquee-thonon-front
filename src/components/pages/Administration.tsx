import { FunctionComponent, useEffect, useState } from "react";
import { Inscription, StatutInscription } from "../../services/inscription";
import { INSCRIPTION_ENDPOINT, VALIDATION_ENDPOINT } from "../../services/services";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import Table from "antd/es/table";
import { Button, Col, Collapse, Dropdown, Form, Input, MenuProps, Row, Select, Spin, Tooltip, notification } from "antd";
import { ClockCircleOutlined, DownOutlined } from "@ant-design/icons";
import { columnsTableInscriptions } from "../common/tableDefinition";
import { ModaleDerniersInscription } from "../modals/ModalDernieresInscriptions";

export const Administration: FunctionComponent = () => {

    const [dataSource, setDataSource] = useState<Inscription[]>();
    const { loggedUser } = useAuth();
    const navigate = useNavigate();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const { Panel } = Collapse;
    const [form] = Form.useForm();
    const [selectedInscriptions, setSelectedInscriptions] = useState<Inscription[]>([]);
    const [modaleDernieresInscriptionOpen, setModaleDernieresInscriptionOpen] = useState<boolean>(false);

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedInscriptions.length === 1 && e.key !== "3") { // Consultation/Modification d'inscription
                let readOnly: boolean = false;
                if (e.key === "1") {
                    readOnly = true;
                }
                navigate("/inscription", { state: { isReadOnly: readOnly, id: selectedInscriptions[0].id, isAdmin: true } })
            } else { // Validation d'inscription
                setApiCallDefinition({ method: "POST", url: VALIDATION_ENDPOINT, data: selectedInscriptions.map(inscription => inscription.id) });
            }
        };

        const items: MenuProps['items'] = [{ label: "Consulter", key: "1", disabled: selectedInscriptions.length !== 1 },
        { label: "Modifier", key: "2", disabled: selectedInscriptions.length !== 1 }, { label: "Valider inscription", key: "3", disabled: selectedInscriptions.length < 1 }];

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
        const searchCriteria = { nom: nom ?? null, prenom: prenom ?? null, telephone: telephone ?? null, statut: statut ?? null }
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
                            <Form.Item name="telephone" label="Téléphone">
                                <Input placeholder="Téléphone" />
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
        if (apiCallDefinition?.url === INSCRIPTION_ENDPOINT && result) {
            setDataSource(result);
            resetApi();
        }
        if (apiCallDefinition?.url === VALIDATION_ENDPOINT && result) {
            notification.open({ message: "Les " + (result as number[]).length + " inscriptions sélectionnées ont été validées", type: "success" });
            setSelectedInscriptions([]);
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT });
        }
    }, [result]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: Inscription[]) => {
            setSelectedInscriptions(selectedRows);
        }
    };

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
                            <div><DropdownMenu /></div>
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
            </Spin>
        </Form>
    ) : <div className="centered-content">Vous n'êtes pas autorisé à accéder à ce contenu. Veuillez vous connecter.</div>
};