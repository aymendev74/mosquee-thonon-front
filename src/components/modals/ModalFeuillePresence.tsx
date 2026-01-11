import { Button, Card, Checkbox, Col, Divider, Form, Input, Modal, notification, Row, Spin, Table, Tag } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import _ from "lodash";
import { buildUrlWithParams, EXISTING_FEUILLE_PRESENCE_ENDPOINT, FEUILLE_PRESENCE_ENDPOINT } from "../../services/services";
import { ClasseDtoF, FeuillePresenceDtoB, FeuillePresenceDtoF, PresenceEleveDto } from "../../services/classe";
import { EleveFront } from "../../services/eleve";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import useApi from "../../hooks/useApi";
import { useMediaQuery } from "react-responsive";

export type ModalFeuillePresenceProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    classe?: ClasseDtoF,
    feuilleToEdit?: FeuillePresenceDtoF,
    readOnly: boolean,
}

export const ModalFeuillePresence: FunctionComponent<ModalFeuillePresenceProps> = ({ open, setOpen, classe, feuilleToEdit, readOnly }) => {
    const { execute, isLoading } = useApi();
    const [form] = Form.useForm();
    const [eleves, setEleves] = useState<EleveFront[]>([]);
    const [selectedEleves, setSelectedEleves] = useState<EleveFront[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    function close() {
        form.resetFields();
        setOpen(false);
    };

    async function onFinish() {
        const dateFeuille = form.getFieldValue("dateFeuille");
        const elevesPresents: PresenceEleveDto[] = selectedEleves.map((eleve) => ({ idEleve: eleve.id!, present: true }));
        const elevesAbsents: PresenceEleveDto[] = eleves.filter((eleve) => !selectedEleves.map((eleve) => eleve.id).includes(eleve.id)).map((eleve) => ({ idEleve: eleve.id!, present: false }));
        const feuillePresence: FeuillePresenceDtoB = {
            date: dayjs(dateFeuille).format(APPLICATION_DATE_FORMAT),
            presenceEleves: [...elevesPresents, ...elevesAbsents],
        }
        let result = null;
        if (feuilleToEdit) { // mise à jour
            result = await execute<FeuillePresenceDtoB>({ method: "PUT", url: buildUrlWithParams(EXISTING_FEUILLE_PRESENCE_ENDPOINT, { id: feuilleToEdit.id }), data: feuillePresence });
        } else { // création
            result = await execute<FeuillePresenceDtoB>({ method: "POST", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id: classe?.id }), data: feuillePresence });
        }
        if (result.success && result.successData) {
            handleSaveSucess(result.successData);
        }
    };

    function handleSaveSucess(result: FeuillePresenceDtoB) {
        if (result) {
            notification.success({ message: "La feuille de présence a bien été enregistrée" });
            setOpen(false);
            setEleves([]);
            setSelectedEleves([]);
        }
    };

    useEffect(() => {
        if (open && classe && classe.liensClasseEleves) {
            const elevesClasses = classe?.liensClasseEleves?.map((lien) => lien.eleve);
            setEleves(elevesClasses);
            if (feuilleToEdit) {
                form.setFieldValue("dateFeuille", feuilleToEdit.date);
                setSelectedEleves(feuilleToEdit.presenceEleves.filter((presence) => presence.present)
                    .map((presence) => elevesClasses.find((eleve) => eleve.id === presence.idEleve)!));
            }
        } else {
            form.resetFields();
            setEleves([]);
            setSelectedEleves([]);
        }
    }, [open]);

    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: EleveFront[]) => {
            setSelectedEleves(selectedRows);
        }
    };

    const columnsTableEleves: ColumnsType<EleveFront> = [
        {
            title: "Nom",
            dataIndex: "nom",
            key: "nom",
        },
        {
            title: "Prénom",
            dataIndex: "prenom",
            key: "prenom",
        },
        {
            title: "Niveau",
            dataIndex: "niveauInterne",
            key: "niveauInterne",
        },
        {
            title: "Date naissance",
            dataIndex: "dateNaissance",
            key: "dateNaissance",
            render: (value, record, index) => {
                return dayjs(record.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT);
            }
        },
    ];

    function formatTotal(total: number) {
        return (<Tag color="geekblue">Total : <strong>{total} élève(s)</strong></Tag>);
    }

    const toggleEleveSelection = (eleve: EleveFront) => {
        const isSelected = selectedEleves.some(e => e.id === eleve.id);
        if (isSelected) {
            setSelectedEleves(selectedEleves.filter(e => e.id !== eleve.id));
        } else {
            setSelectedEleves([...selectedEleves, eleve]);
        }
    };

    const renderElevesCards = () => {
        return (
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingBottom: '16px' }}>
                <Row gutter={[16, 16]}>
                    {eleves.map((eleve) => {
                        const isSelected = selectedEleves.some(e => e.id === eleve.id);
                        return (
                            <Col xs={24} key={eleve.id}>
                                <Card
                                    size="small"
                                    hoverable={!readOnly}
                                    onClick={() => !readOnly && toggleEleveSelection(eleve)}
                                    style={{
                                        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                        cursor: readOnly ? 'default' : 'pointer',
                                        backgroundColor: isSelected ? '#e6f7ff' : '#fff'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Checkbox checked={isSelected} disabled={readOnly} />
                                                <strong>{eleve.nom} {eleve.prenom}</strong>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8c8c8c' }}>
                                                <span><strong>Niveau:</strong> {eleve.niveauInterne}</span>
                                                <span><strong>Né(e) le:</strong> {dayjs(eleve.dateNaissance, APPLICATION_DATE_FORMAT).format(APPLICATION_DATE_FORMAT)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    {formatTotal(eleves.length)}
                </div>
            </div>
        );
    };

    return (<Modal title="Feuille de présence" open={open} width={500} onCancel={close} footer={<></>}>
        <Form
            name="feuillePresence"
            autoComplete="off"
            form={form}
            onFinish={onFinish}
        >
            <Spin spinning={isLoading}>
                <Divider orientation="left">Date du cours</Divider>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <DatePickerFormItem name="dateFeuille" label="Date" rules={[{ required: true, message: "Veuillez saisir la date de la feuille de présence" }]}
                            disabled={readOnly} />
                    </Col>
                </Row>
                <Divider orientation="left">Liste des élèves</Divider>
                <h3>Selectionnez les élèves qui ont assisté au cours</h3>
                {isMobile ? (
                    renderElevesCards()
                ) : (
                    <Table dataSource={eleves}
                        columns={columnsTableEleves}
                        rowSelection={{ type: "checkbox", getCheckboxProps: readOnly ? () => ({ disabled: true }) : undefined, selectedRowKeys: selectedEleves.map(eleve => eleve.id!), ...rowSelection }}
                        pagination={{ pageSize: 10, showTotal: formatTotal }}
                        rowKey={record => record.id!} />
                )}
            </Spin>
            <Row gutter={[16, 32]}>
                <Col span={24} style={{ textAlign: "right" }}>
                    <Button onClick={close} icon={<CloseOutlined />}>Annuler</Button>
                    <Button className="m-left-10" htmlType="submit" icon={<CheckOutlined />} disabled={readOnly} danger>Valider</Button>
                </Col>
            </Row>
        </Form>
    </Modal>);

}