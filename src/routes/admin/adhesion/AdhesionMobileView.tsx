import { FunctionComponent, useState } from "react";
import { Button, Card, Checkbox, Collapse, Dropdown, Form, Input, InputNumber, Pagination, Select, Tag, Tooltip } from "antd";
import { CheckCircleTwoTone, DeleteTwoTone, DownOutlined, EditTwoTone, EyeTwoTone, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AdhesionLight } from "../../../services/adhesion";
import { StatutInscription } from "../../../services/inscription";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../utils/FormUtils";
import dayjs from "dayjs";
import { AdhesionViewProps } from "./types";
import type { MenuProps } from 'antd';
import { SelectionActionBar } from "../../../components/common/SelectionActionBar";

interface MobileAdhesionCardProps {
    adhesion: AdhesionLight;
    isSelected: boolean;
    onToggleSelection: () => void;
    onValidate: (adhesionId: number) => Promise<void>;
    onDelete: (adhesionId: number) => Promise<void>;
}

const MobileAdhesionCard: FunctionComponent<MobileAdhesionCardProps> = ({
    adhesion,
    isSelected,
    onToggleSelection,
    onValidate,
    onDelete
}) => {
    const navigate = useNavigate();

    return (
        <Card className="adhesion-card-mobile" size="small">
            <div className="adhesion-card-header">
                <div className="adhesion-card-name">
                    {adhesion.prenom} {adhesion.nom}
                </div>
                <Checkbox checked={isSelected} onChange={onToggleSelection} />
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
                <Button size="small" type="primary" onClick={() => navigate(`/adhesions/${adhesion.id}?readonly=true`)}>
                    <EyeTwoTone /> Consulter
                </Button>
                <Button size="small" onClick={() => navigate(`/adhesions/${adhesion.id}?readonly=false`)}>
                    <EditTwoTone /> Modifier
                </Button>
                <Button
                    size="small"
                    type="primary"
                    disabled={adhesion.statut === StatutInscription.VALIDEE}
                    onClick={() => onValidate(adhesion.id)}
                >
                    <CheckCircleTwoTone /> Valider
                </Button>
                <Button
                    size="small"
                    danger
                    onClick={() => onDelete(adhesion.id)}
                >
                    <DeleteTwoTone /> Supprimer
                </Button>
            </div>
        </Card>
    );
};

export const AdhesionMobileView: FunctionComponent<AdhesionViewProps> = ({
    dataSource,
    selectedAdhesions,
    setSelectedAdhesions,
    onValidateAdhesion,
    onValidateAdhesions,
    onDeleteAdhesion,
    onDeleteAdhesions,
    onSearch,
}) => {
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);
    const pageSize = 10;

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
        setCollapseActiveKey([]);
    };


    const inputFiltersConfig = [
        { name: "prenom", libelle: "Prénom", inputType: "InputText" as const },
        { name: "nom", libelle: "Nom", inputType: "InputText" as const },
        { name: "montant", libelle: "Montant", inputType: "InputNumber" as const },
        {
            name: "statut", libelle: "Statut", inputType: "Select" as const, selectOptions: [
                { value: StatutInscription.PROVISOIRE, label: "Provisoire" },
                { value: StatutInscription.VALIDEE, label: "Validée" }
            ]
        },
    ];

    const SearchFiltersNoCard = () => {
        return (
            <div>
                {inputFiltersConfig.map(filter => {
                    let inputElement;

                    if (filter.inputType === "InputText") {
                        inputElement = <Input placeholder={filter.libelle} onPressEnter={doSearch} />;
                    } else if (filter.inputType === "InputNumber") {
                        inputElement = <InputNumber placeholder={filter.libelle} style={{ width: '100%' }} onPressEnter={doSearch} />;
                    } else if (filter.inputType === "Select" && 'selectOptions' in filter) {
                        inputElement = <Select placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
                    }

                    return (
                        <Form.Item key={filter.name} name={filter.name} label={filter.libelle}>
                            {inputElement}
                        </Form.Item>
                    );
                })}
                <div className="centered-content">
                    <Button icon={<SearchOutlined />} onClick={doSearch} style={{ marginRight: "10px" }} type="primary">Rechercher</Button>
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

    const handleToggleSelection = (adhesion: AdhesionLight) => {
        const isSelected = selectedAdhesions.some(a => a.id === adhesion.id);
        if (isSelected) {
            setSelectedAdhesions(selectedAdhesions.filter(a => a.id !== adhesion.id));
        } else {
            setSelectedAdhesions([...selectedAdhesions, adhesion]);
        }
    };

    return (
        <Form
            name="adminAdhesionMobile"
            autoComplete="off"
            form={form}
        >
            <Collapse
                activeKey={collapseActiveKey}
                onChange={(keys) => setCollapseActiveKey(keys as string[])}
                items={filterCollapseItems}
                className="mobile-filters-collapse"
            />

            {dataSource && dataSource.length > 0 ? (
                <>
                    <div className="mobile-results-header">
                        <h3>Résultats</h3>
                    </div>

                    <div className="adhesion-cards-mobile">
                        {dataSource
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map(adhesion => (
                                <MobileAdhesionCard
                                    key={adhesion.id}
                                    adhesion={adhesion}
                                    isSelected={selectedAdhesions.some(a => a.id === adhesion.id)}
                                    onToggleSelection={() => handleToggleSelection(adhesion)}
                                    onValidate={onValidateAdhesion}
                                    onDelete={onDeleteAdhesion}
                                />
                            ))}
                    </div>

                    {/* Barre d'actions groupées mobile (au-dessus de la pagination) */}
                    <SelectionActionBar
                        selectedCount={selectedAdhesions.length}
                        itemLabel="adhésion"
                        onValidate={() => onValidateAdhesions(selectedAdhesions)}
                        onDelete={() => onDeleteAdhesions(selectedAdhesions)}
                        onCancel={() => setSelectedAdhesions([])}
                        mobile={true}
                    />

                    <div className="mobile-pagination">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={dataSource.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} adhésions`}
                        />
                    </div>
                </>
            ) : (
                <div className="no-results">
                    Aucune adhésion trouvée
                </div>
            )}
        </Form>
    );
};
