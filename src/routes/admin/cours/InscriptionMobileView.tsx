import { FunctionComponent, useState } from "react";
import { Button, Card, Checkbox, Collapse, Dropdown, Form, Input, InputNumber, Pagination, Select, Tag, DatePicker, Tooltip } from "antd";
import { CheckCircleTwoTone, DeleteTwoTone, DownOutlined, EditTwoTone, EyeTwoTone, SearchOutlined, WarningOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { InscriptionLight, StatutInscription } from "../../../services/inscription";
import { APPLICATION_DATE_FORMAT, APPLICATION_DATE_TIME_FORMAT } from "../../../utils/FormUtils";
import dayjs from "dayjs";
import { InscriptionViewProps } from "./types";
import type { MenuProps } from 'antd';
import { getStatutInscriptionOptions } from "../../../components/common/commoninputs";
import { InputSearchFieldDef } from "../../../components/common/AdminSearchFilter";
import { SelectionActionBar } from "../../../components/common/SelectionActionBar";

interface MobileInscriptionCardProps {
    inscription: InscriptionLight;
    isSelected: boolean;
    onToggleSelection: () => void;
    onValidate: (inscriptionId: number) => Promise<void>;
    onDelete: (inscriptionId: number) => Promise<void>;
    application: string;
}

const MobileInscriptionCard: FunctionComponent<MobileInscriptionCardProps> = ({
    inscription,
    isSelected,
    onToggleSelection,
    onValidate,
    onDelete,
    application
}) => {
    const navigate = useNavigate();

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
                <Checkbox checked={isSelected} onChange={onToggleSelection} />
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
                    navigate(`${path}/${inscription.idInscription}?readonly=true`);
                }}>
                    <EyeTwoTone /> Consulter
                </Button>
                <Button size="small" onClick={() => {
                    const path = application === "COURS_ENFANT" ? "/coursEnfants" : "/coursAdultes";
                    navigate(`${path}/${inscription.idInscription}?readonly=false`);
                }}>
                    <EditTwoTone /> Modifier
                </Button>
                <Button
                    size="small"
                    type="primary"
                    disabled={inscription.statut === StatutInscription.VALIDEE}
                    onClick={() => onValidate(inscription.idInscription)}
                >
                    <CheckCircleTwoTone /> Valider
                </Button>
                <Button
                    size="small"
                    danger
                    onClick={() => onDelete(inscription.idInscription)}
                >
                    <DeleteTwoTone /> Supprimer
                </Button>
            </div>
        </Card>
    );
};

export const InscriptionMobileView: FunctionComponent<InscriptionViewProps> = ({
    application,
    type,
    dataSource,
    selectedInscriptions,
    setSelectedInscriptions,
    periodesOptions,
    onValidateInscription,
    onValidateInscriptions,
    onDeleteInscription,
    onDeleteInscriptions,
    onSearch,
}) => {
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);
    const pageSize = 10;

    const navigate = useNavigate();

    const buildSearchCriteria = () => {
        const { nom, prenom, telephone, statut, noInscription, idPeriode } = form.getFieldsValue();
        let dateInscription = form.getFieldValue("dateInscription");
        if (dateInscription) {
            dateInscription = dayjs(dateInscription).format(APPLICATION_DATE_FORMAT);
        }
        const niveaux = form.getFieldValue("niveau");
        const niveauxInternes = form.getFieldValue("niveauInterne");
        const searchType = application === "COURS_ENFANT" ? "ENFANT" : "ADULTE";
        return {
            nom: nom ?? null,
            prenom: prenom ?? null,
            telephone: telephone ?? null,
            statut: statut ?? null,
            dateInscription: dateInscription ?? null,
            niveaux: niveaux ?? null,
            niveauxInternes: niveauxInternes ?? null,
            noInscription: noInscription ?? null,
            idPeriode: idPeriode ?? null,
            type: searchType
        };
    };

    const doSearch = async () => {
        const searchCriteria = buildSearchCriteria();
        await onSearch(searchCriteria);
        setCollapseActiveKey([]);
    };

    const getSearchFilters = () => {
        let filters: InputSearchFieldDef[] = [
            { name: "idPeriode", libelle: "Période", inputType: "Select", selectOptions: periodesOptions },
            { name: "prenom", libelle: "Prénom", inputType: "InputText" },
            { name: "nom", libelle: "Nom", inputType: "InputText" },
            { name: "noInscription", libelle: "N° inscription", inputType: "InputText" },
            { name: "statut", libelle: "Statut", inputType: "Select", selectOptions: getStatutInscriptionOptions() },
        ];
        return filters;
    };

    const SearchFiltersNoCard = () => {
        const filters = getSearchFilters();

        return (
            <div>
                {filters.map(filter => {
                    let inputElement;

                    if (filter.inputType === "InputText") {
                        inputElement = <Input placeholder={filter.libelle} onPressEnter={doSearch} />;
                    } else if (filter.inputType === "InputNumber") {
                        inputElement = <InputNumber placeholder={filter.libelle} style={{ width: '100%' }} onPressEnter={doSearch} />;
                    } else if (filter.inputType === "Date") {
                        inputElement = <DatePicker placeholder={filter.libelle} style={{ width: '100%' }} onChange={doSearch} />;
                    } else if (filter.inputType === "Select" && 'selectOptions' in filter) {
                        inputElement = <Select placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
                    } else if (filter.inputType === "SelectTags" && 'selectOptions' in filter) {
                        inputElement = <Select mode="multiple" placeholder={filter.libelle} options={filter.selectOptions} allowClear />;
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

    const handleToggleSelection = (inscription: InscriptionLight) => {
        const isSelected = selectedInscriptions.some(i => i.id === inscription.id);
        if (isSelected) {
            setSelectedInscriptions(selectedInscriptions.filter(i => i.id !== inscription.id));
        } else {
            setSelectedInscriptions([...selectedInscriptions, inscription]);
        }
    };

    return (
        <Form
            name="adminInscriptionMobile"
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
                            .map(inscription => (
                                <MobileInscriptionCard
                                    key={inscription.id}
                                    inscription={inscription}
                                    isSelected={selectedInscriptions.some(i => i.id === inscription.id)}
                                    onToggleSelection={() => handleToggleSelection(inscription)}
                                    onValidate={onValidateInscription}
                                    onDelete={onDeleteInscription}
                                    application={application}
                                />
                            ))}
                    </div>

                    {/* Barre d'actions groupées mobile (au-dessus de la pagination) */}
                    <SelectionActionBar
                        selectedCount={selectedInscriptions.length}
                        itemLabel="inscription"
                        onValidate={() => onValidateInscriptions(selectedInscriptions)}
                        onDelete={() => onDeleteInscriptions(selectedInscriptions)}
                        onCancel={() => setSelectedInscriptions([])}
                        mobile={true}
                    />

                    <div className="mobile-pagination">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={dataSource.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showTotal={(total, range) => `${range[0]}-${range[1]} sur ${total} inscriptions`}
                        />
                    </div>
                </>
            ) : (
                <div className="no-results">
                    Aucune inscription trouvée
                </div>
            )}
        </Form>
    );
};
