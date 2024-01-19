import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect } from "react"
import { PeriodeInfoDto } from "../../services/periode";
import useApi from "../../hooks/useApi";
import { PERIODES_ENDPOINT } from "../../services/services";
import moment, { Moment } from "moment";
import { InputNumberFormItem } from "../common/InputNumberFormItem";


export type ModalPeriodeProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    periode?: PeriodeInfoDto,
}

export const ModalPeriode: FunctionComponent<ModalPeriodeProps> = ({ open, setOpen, isCreation, periode }) => {
    const { result, apiCallDefinition, setApiCallDefinition, resetApi } = useApi();
    const [form] = Form.useForm();
    const close = () => {
        form.resetFields();
        setOpen(false)
    };
    const onValider = () => {
        const periodeToSave: PeriodeInfoDto = form.getFieldsValue();
        periodeToSave.dateDebut = (periodeToSave.dateDebut as Moment).format("DD.MM.YYYY");
        periodeToSave.dateFin = (periodeToSave.dateFin as Moment).format("DD.MM.YYYY");
        setApiCallDefinition({ method: "POST", url: PERIODES_ENDPOINT, data: periodeToSave });
    }

    const getTitre = () => {
        return isCreation ? "Création d'une nouvelle période" : "Modification d'une période";
    }

    useEffect(() => {
        if (periode) {
            periode.dateDebut = moment(periode.dateDebut, "DD.MM.YYYY");
            periode.dateFin = moment(periode.dateFin, "DD.MM.YYYY");
            console.log(periode);
            form.setFieldsValue(periode);
        }
    }, [periode]);

    useEffect(() => {
        if (result) {
            let message;
            if (isCreation) {
                message = "La période a bien été créée";
            } else {
                message = "La période a bien été modifiée";
            }
            notification.open({ message, type: "success" });
            close();
        }
    }, [result]);


    return (<Modal title={getTitre()} open={open} width={600} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onValider} danger>Valider</Button></>}>
        <Form
            name="basic"
            autoComplete="off"
            form={form}
        >
            <Form.Item name="id" style={{ display: "none" }}>
                <Input type="hidden" />
            </Form.Item>
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <Form.Item
                        label="Date début"
                        name={"dateDebut"}
                    >
                        <DatePicker disabled={periode?.existInscription} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Date fin"
                        name="dateFin"
                    >
                        <DatePicker />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <Tooltip title="Au delà, les inscriptions seront sur liste d'attente" color="geekblue">
                        <InputNumberFormItem name="nbMaxInscription" label="Nombre d'élève (maximum)" />
                    </Tooltip>
                </Col>
            </Row>
        </Form>
    </Modal>);

}