import { Button, Col, Form, Modal, Row, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import { PeriodeInfoDto } from "../../services/periode";
import useApi from "../../hooks/useApi";
import moment, { Moment } from "moment";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { InputFormItem } from "../common/InputFormItem";
import _ from "lodash";
import { PERIODES_ENDPOINT } from "../../services/services";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";


export type ModalPeriodeProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    periode?: PeriodeInfoDto,
}

export const ModalPeriode: FunctionComponent<ModalPeriodeProps> = ({ open, setOpen, isCreation, periode }) => {
    const { result, setApiCallDefinition, resetApi } = useApi();
    const [error, setError] = useState<string | undefined>();
    const [form] = Form.useForm();

    const close = () => {
        form.resetFields();
        setOpen(false);
        setError(undefined);
    };
    const onValider = () => {
        form.validateFields().then((values) => {
            const periodeToSave = _.cloneDeep(values);
            periodeToSave.dateDebut = periodeToSave.dateDebut.format(APPLICATION_DATE_FORMAT);
            periodeToSave.dateFin = periodeToSave.dateFin.format(APPLICATION_DATE_FORMAT);
            setError(undefined);
            const today = moment();
            let isError: boolean = false;
            if (isCreation && !today.isBefore(moment(periodeToSave.dateDebut, APPLICATION_DATE_FORMAT))) {
                setError("La date de début doit être dans le futur. Veuillez corriger");
                isError = true;
            }
            if (!moment(periodeToSave.dateDebut, APPLICATION_DATE_FORMAT).isBefore(moment(periodeToSave.dateFin, APPLICATION_DATE_FORMAT))) {
                setError("La date de début doit être inférieur à la date de fin. Veuillez corriger");
                isError = true;
            }
            if (!isError) {
                setApiCallDefinition({ method: "POST", url: PERIODES_ENDPOINT, data: periodeToSave });
            }
        }).catch((errorInfo) => {
            console.error("Validation failed:", errorInfo);
        });
    }

    const getTitre = () => {
        return isCreation ? "Création d'une nouvelle période" : "Modification d'une période";
    }

    useEffect(() => {
        if (periode) {
            periode.dateDebut = moment(periode.dateDebut, APPLICATION_DATE_FORMAT);
            periode.dateFin = moment(periode.dateFin, APPLICATION_DATE_FORMAT);
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
            resetApi();
        }
    }, [result]);


    return (<Modal title={getTitre()} open={open} width={600} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onValider} danger>Valider</Button></>}>
        <Form
            name="periode"
            autoComplete="off"
            form={form}
        >
            <InputFormItem name="id" formStyle={{ display: "none" }} type="hidden" />
            <InputFormItem name="signature" formStyle={{ display: "none" }} type="hidden" />
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <DatePickerFormItem label="Date début" name="dateDebut" disabled={periode?.existInscription} />
                </Col>
                <Col span={12}>
                    <DatePickerFormItem label="Date fin" name="dateFin" />
                </Col>
            </Row>
            <Row gutter={[16, 32]}>
                <Col span={12}>
                    <Tooltip title="Au delà, les inscriptions seront sur liste d'attente" color="geekblue">
                        <InputNumberFormItem name="nbMaxInscription" label="Nombre d'élève (maximum)" />
                    </Tooltip>
                </Col>
            </Row>
            {error && (<div className="form-errors">
                {error}
            </div>)}
        </Form>
    </Modal>);

}