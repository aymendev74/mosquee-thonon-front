import { Button, Col, Divider, Form, Row, Select, Tag, Tooltip } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { PERIODES_ENDPOINT, TARIFS_ADMIN_ENDPOINT, TARIFS_ENDPOINT } from "../../services/services";
import useApi from "../../hooks/useApi";
import { PeriodeInfoDto } from "../../services/periode";
import { DefaultOptionType } from "antd/es/select";
import moment from "moment";
import { EditOutlined, EuroCircleTwoTone, PlusCircleOutlined } from "@ant-design/icons";
import { InfosTarif } from "../admin/InfosTarif";
import { ModalPeriode } from "../modals/ModalPeriode";
import { SelectFormItem } from "../common/SelectFormItem";

export const AdminTarifs: FunctionComponent = () => {

    const [form] = Form.useForm();
    const { result, apiCallDefinition, setApiCallDefinition, resetApi, isLoading } = useApi();
    const [periodesDto, setPeriodesDto] = useState<PeriodeInfoDto[]>();
    const [modalPeriodeOpen, setModalPeriodeOpen] = useState<boolean>(false);
    const [createPeriode, setCreatePeriode] = useState<boolean>(false);
    const [periodeToEdit, setPeriodeToEdit] = useState<PeriodeInfoDto>();
    const [periodesOptions, setPeriodesOptions] = useState<DefaultOptionType[]>();
    const [selectedIdPeriode, setSelectedIdPeriode] = useState(form.getFieldValue("id"));
    const [viewTarif, setViewTarif] = useState<boolean>(false);

    useEffect(() => {
        const fetchPeriodes = async () => {
            setApiCallDefinition({ method: "GET", url: PERIODES_ENDPOINT });
        }
        fetchPeriodes();
    }, [modalPeriodeOpen]);

    useEffect(() => {
        if (apiCallDefinition?.url === PERIODES_ENDPOINT && apiCallDefinition.method === "GET" && result) {
            const resultAsPeriodeDto = result as PeriodeInfoDto[];
            setPeriodesDto(resultAsPeriodeDto);
            const periodesOptions: DefaultOptionType[] = [];
            resultAsPeriodeDto.forEach(periode => periodesOptions.push({ value: periode.id, label: formatPeriodeLibelle(periode) }));
            setPeriodesOptions(periodesOptions);
            resetApi();
        }
        if (apiCallDefinition?.url?.startsWith(TARIFS_ADMIN_ENDPOINT) && apiCallDefinition.method === "GET" && result) {
            setViewTarif(true);

            form.setFieldsValue(result);
        }
    }, [result]);

    const formatPeriodeLibelle = (periode: PeriodeInfoDto) => {
        let libelle = moment(periode.dateDebut).format("DD.MM.YYYY");
        if (periode.dateFin === "31.12.9999") {
            libelle = libelle.concat(" - (En cours)");
        } else {
            libelle = libelle.concat(moment(periode.dateFin).format("DD.MM.YYYY"));
        }
        return <Tag color="blue">{libelle}</Tag>;
    }

    const onEditTarif = () => {
        setApiCallDefinition({ method: "GET", url: TARIFS_ADMIN_ENDPOINT + "/" + selectedIdPeriode });
    }

    const onCreatePeriode = () => {
        setModalPeriodeOpen(true);
        setCreatePeriode(true);
    }

    const onModifierPeriode = () => {
        setModalPeriodeOpen(true);
        setCreatePeriode(false);
        setPeriodeToEdit(periodesDto?.find(p => p.id === selectedIdPeriode));
    }

    const isSelectedPeriodeReadOnly = () => {
        return periodesDto?.find(p => p.id === selectedIdPeriode)?.existInscription ?? false;
    }

    return (<>
        <Form
            name="basic"
            autoComplete="off"
            className="container-full-width"
            form={form}
        >
            <h2>Administration des tarifs</h2>
            <Row gutter={[16, 32]}>
                <Col span={24}>
                    <Divider orientation="left">Période</Divider>
                </Col>
            </Row>
            <Row gutter={[16, 32]}>
                <Col span={6}>
                    <SelectFormItem name="idPeriode" label="Période" options={periodesOptions} onChange={(value) => { setSelectedIdPeriode(value) }} />
                </Col>
                <Col span={4}>
                    <Tooltip title="Modifier les données de la période sélectionnée" color="geekblue"><Button icon={<EditOutlined />}
                        type="primary" disabled={!selectedIdPeriode} onClick={onModifierPeriode}>Modifier</Button>
                    </Tooltip>
                    <Tooltip title="Créer une nouvelle période" color="geekblue">
                        <Button icon={<PlusCircleOutlined />} type="primary" className="m-left-10" onClick={onCreatePeriode}>Créer</Button>
                    </Tooltip>
                    <Tooltip title="Consulter/Modifier les tarifs" color="geekblue">
                        <Button icon={<EuroCircleTwoTone />} type="primary" className="m-left-10"
                            disabled={!selectedIdPeriode} onClick={onEditTarif} />
                    </Tooltip>
                </Col>
            </Row>
            {viewTarif && (<InfosTarif readOnly={isSelectedPeriodeReadOnly()} />)}
            <ModalPeriode open={modalPeriodeOpen} setOpen={setModalPeriodeOpen} isCreation={createPeriode} periode={periodeToEdit} />
        </Form>
    </>);
}