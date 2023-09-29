import { FunctionComponent, useEffect, useState } from "react";
import { Inscription, StatutInscription } from "../../services/inscription";
import { INSCRIPTION_ENDPOINT } from "../../services/services";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import useApi from "../../services/useApi";
import Table, { ColumnsType } from "antd/es/table";
import { Button, Col, Collapse, Dropdown, Form, Input, Menu, MenuProps, Row, Select, Tooltip } from "antd";
import { CheckCircleTwoTone, DownOutlined, PauseCircleTwoTone } from "@ant-design/icons";
import { read } from "fs";

export const Inscriptions: FunctionComponent = () => {

    const [dataSource, setDataSource] = useState<Inscription[]>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { result, setApiCallDefinition } = useApi();
    const { Panel } = Collapse;
    const [form] = Form.useForm();
    const [selectedInscription, setSelectedInscription] = useState<Inscription | undefined>();

    const DropdownMenu = () => {
        const handleMenuClick = (e: any) => {
            if (selectedInscription) {
                let readOnly: boolean = false;
                if (e.key === "1") {
                    readOnly = true;
                }
                navigate("/inscription", { state: { readOnly: readOnly, id: selectedInscription.id, isAdmin: true } })
            }

        };

        const items: MenuProps['items'] = [{ label: "Consulter", key: "1" }, { label: "Modifier", key: "2" }, { label: "Valider inscription", key: "3" }];
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
        console.log(searchCriteria);
        setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT, params: searchCriteria });
    }

    const SearchCollapse = () => {
        return (
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Filtres de recherche" key="1">
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="prenom" label="Prénom">
                                <Input placeholder="Prénom" onBlur={doSearch} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="nom" label="Nom">
                                <Input placeholder="Nom" onBlur={doSearch} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="telephone" label="Téléphone">
                                <Input placeholder="Téléphone" onBlur={doSearch} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[0, 32]}>
                        <Col span={24}>
                            <Form.Item name="statut" label="Statut">
                                <Select placeholder="Statut" onBlur={doSearch} options={[
                                    { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                                    { value: StatutInscription.VALIDEE, label: "Validée" }
                                ]} onSelect={doSearch} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>
        );
    };

    const columns: ColumnsType<Inscription> = [
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
            title: 'Sexe',
            dataIndex: 'sexe',
            key: 'sexe',
        },
        {
            title: 'Téléphone',
            dataIndex: 'telephone',
            key: 'telephone',
        },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: (value, record, index) => {
                return (value === StatutInscription.VALIDEE ?
                    <Tooltip title="Inscription validée" color="green"><CheckCircleTwoTone /></Tooltip> :
                    <Tooltip title="Inscription non validée" color="red"><PauseCircleTwoTone /></Tooltip>);
            }
        }
    ];

    useEffect(() => {
        const fetchInscriptions = async () => {
            setApiCallDefinition({ method: "GET", url: INSCRIPTION_ENDPOINT });
        }

        // Si l'utilisateur a réussi à accéder directement à cette partie protégée sans être authentifié (via l'URL en général)
        // alors on le redirige vers la page d'authentification
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            fetchInscriptions();
        }

    }, []);

    useEffect(() => {
        setDataSource(result);
    }, [result]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: Inscription[]) => {
            setSelectedInscription(selectedRows[0]);
        }
    };

    return (<>
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
            className="container-full-width"
            form={form}
        >

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
                            <Table rowSelection={{ type: "radio", ...rowSelection }} columns={columns} dataSource={dataSource} />
                        </Col>
                    </Row>
                </div>
            </div>
        </Form>
    </>)
};