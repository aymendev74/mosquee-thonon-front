import { Button, Col, Form, Modal, Row, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import { PeriodeInfoDto, PeriodeValidationResultDto } from "../../services/periode";
import useApi from "../../hooks/useApi";
import moment, { Moment } from "moment";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import { InputFormItem } from "../common/InputFormItem";
import _ from "lodash";
import { PERIODES_ENDPOINT, PERIODES_VALIDATION_ENDPOINT } from "../../services/services";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";


export type ModalPeriodeProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    periode?: PeriodeInfoDto,
}

export const ModalPeriode: FunctionComponent<ModalPeriodeProps> = ({ open, setOpen, isCreation, periode }) => {
    const { isLoading, result, setApiCallDefinition, apiCallDefinition, resetApi } = useApi();
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
            if (!periodeToSave.application) {
                periodeToSave.application = "COURS";
            }
            setError(undefined);
            setApiCallDefinition({ method: "POST", url: PERIODES_VALIDATION_ENDPOINT, data: periodeToSave });
            /*if (isCreation && !today.isBefore(moment(periodeToSave.dateDebut, APPLICATION_DATE_FORMAT))) {
                setError("La date de début doit être dans le futur. Veuillez corriger");
                isError = true;
            }
            if (!moment(periodeToSave.dateDebut, APPLICATION_DATE_FORMAT).isBefore(moment(periodeToSave.dateFin, APPLICATION_DATE_FORMAT))) {
                setError("La date de début doit être inférieur à la date de fin. Veuillez corriger");
                isError = true;
            }
            if (!isError) {
                setApiCallDefinition({ method: "POST", url: PERIODES_ENDPOINT, data: periodeToSave });
            }*/
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

    const getErrorLabel = (errorCode: string) => {
        if (errorCode === "OVERLAP") {
            return "Il y a un chevauchement avec une autre période. Veuillez corrgier les dates.";
        } else if (errorCode === "INSCRIPTION_OUTSIDE") {
            return "Il existe une ou plusieurs inscriptions sur cette période dont la date d'inscription se situe en dehors de la plage. Veuillez corrgier les dates.";
        } else if (errorCode === "NB_MAX_INSCRIPTION") {
            return "Il existe actuellement un nombre d'inscriptions sur cette période supérieur au nombre maximum d'élèves. Veuillez corrgier votre saisie.";
        }
    }

    useEffect(() => {
        if (apiCallDefinition?.url === PERIODES_ENDPOINT && result) {
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
        if (apiCallDefinition?.url === PERIODES_VALIDATION_ENDPOINT && result) {
            const resultAsValidationResult = result as PeriodeValidationResultDto;
            if (resultAsValidationResult.success) {
                setApiCallDefinition({ method: "POST", url: PERIODES_ENDPOINT, data: resultAsValidationResult.periode });
            } else {
                setError(getErrorLabel(resultAsValidationResult.errorCode));
                resetApi();
            }
        }
    }, [result]);


    return (<Modal title={getTitre()} open={open} width={600} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onValider} danger>Valider</Button></>}>
        <Form
            name="periode"
            autoComplete="off"
            form={form}
        >
            <Spin spinning={isLoading}>
                <InputFormItem name="id" formStyle={{ display: "none" }} type="hidden" />
                <InputFormItem name="application" formStyle={{ display: "none" }} type="hidden" />
                <InputFormItem name="signature" formStyle={{ display: "none" }} type="hidden" />
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <DatePickerFormItem label="Date début" name="dateDebut" />
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
            </Spin>
        </Form>
    </Modal>);

}