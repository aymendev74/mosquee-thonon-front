import { FunctionComponent } from "react";
import { Button, Card, Col, Form, Row, Space, Table, Tag, Tooltip } from "antd";
import { CheckCircleOutlined, CheckCircleTwoTone, DeleteOutlined, EditOutlined, EyeOutlined, FileExcelOutlined, FilePdfTwoTone, PauseCircleTwoTone } from "@ant-design/icons";
import { SelectionActionBar } from "../../../components/common/SelectionActionBar";
import { useNavigate } from "react-router-dom";
import { AdhesionLight } from "../../../services/adhesion";
import { StatutInscription } from "../../../services/inscription";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../utils/FormUtils";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { AdhesionViewProps } from "./types";
import { AdminSearchFilter } from "../../../components/common/AdminSearchFilter";
import { buildUrlWithParams, DOCUMENT_CONTENT_ENDPOINT } from "../../../services/services";

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
}) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

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
                    <Tooltip title="Consulter" color="geekblue">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => navigate(`/adhesions/${adhesion.id}?readonly=true`)}
                            type="primary"
                        />
                    </Tooltip>
                    <Tooltip title="Modifier" color="geekblue">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => navigate(`/adhesions/${adhesion.id}?readonly=false`)}
                            type="primary"
                        />
                    </Tooltip>
                    <Tooltip title="Valider" color="geekblue">
                        <Button
                            icon={<CheckCircleOutlined />}
                            size="small"
                            type="primary"
                            disabled={adhesion.statut === StatutInscription.VALIDEE}
                            onClick={() => onValidateAdhesion(adhesion.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer" color="geekblue">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={() => onDeleteAdhesion(adhesion.id)}
                            type="primary"
                        />
                    </Tooltip>
                    {adhesion.idDocument ? (
                        <Tooltip title="Télécharger PDF" color="geekblue">
                            <Button
                                icon={<FilePdfTwoTone />}
                                size="small"
                                type="primary"
                                onClick={() => {
                                    const url = buildUrlWithParams(DOCUMENT_CONTENT_ENDPOINT, { idDocument: adhesion.idDocument });
                                    window.open(`${process.env.REACT_APP_BASE_URL_API_V1}${url}`, '_blank');
                                }}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Le document n'est pas encore disponible" color="orange">
                            <Button icon={<FilePdfTwoTone />} size="small" type="primary" disabled />
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

    const existAdhesions = () => {
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
            <div>
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
                        {/* Barre d'actions groupées */}
                        <SelectionActionBar
                            selectedCount={selectedAdhesions.length}
                            itemLabel="adhésion"
                            onValidate={() => onValidateAdhesions(selectedAdhesions)}
                            onDelete={() => onDeleteAdhesions(selectedAdhesions)}
                            onCancel={() => setSelectedAdhesions([])}
                        />

                        {/* Bouton d'export toujours visible */}
                        <div style={{ marginBottom: '16px' }}>
                            <Tooltip title="Exporter tous les résultats de la recherche dans un fichier Excel">
                                <Button
                                    icon={<FileExcelOutlined />}
                                    onClick={onExport}
                                    disabled={!existAdhesions()}
                                    type="primary"
                                >
                                    Exporter les résultats ({dataSource.length})
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
