import { Button, Col, Form, Modal, Row, Spin, Tooltip, notification } from "antd";
import { FunctionComponent, useEffect, useState } from "react"
import { PeriodeDtoBack, PeriodeDtoFront, PeriodeInfoDto, PeriodeValidationResultDto } from "../../services/periode";
import useApi from "../../hooks/useApi";
import { InputNumberFormItem } from "../common/InputNumberFormItem";
import { DatePickerFormItem } from "../common/DatePickerFormItem";
import _ from "lodash";
import { ApiCallbacks, buildUrlWithParams, handleApiCall, PERIODES_ENDPOINT, PERIODES_EXISTING_ENDPOINT, PERIODES_EXISTING_VALIDATION_ENDPOINT, PERIODES_VALIDATION_ENDPOINT } from "../../services/services";
import { APPLICATION_DATE_FORMAT } from "../../utils/FormUtils";
import dayjs, { Dayjs } from "dayjs";
import { ApplicationTarif } from "../../services/tarif";


export type ModalPeriodeProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    isCreation: boolean,
    periode?: PeriodeInfoDto,
    application: ApplicationTarif,
}

export const ModalPeriode: FunctionComponent<ModalPeriodeProps> = ({ open, setOpen, isCreation, periode, application }) => {
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
            const periodeDto: PeriodeDtoFront = _.cloneDeep(values);
            const periodeToSave: PeriodeDtoBack = {
                dateDebut: periodeDto.dateDebut.format(APPLICATION_DATE_FORMAT),
                dateFin: periodeDto.dateFin.format(APPLICATION_DATE_FORMAT),
                anneeDebut: periodeDto.anneeDebut.year(),
                anneeFin: periodeDto.anneeFin.year(),
                nbMaxInscription: periodeDto.nbMaxInscription,
                application
            };
            setError(undefined);
            if (isCreation) {
                setApiCallDefinition({ method: "POST", url: PERIODES_VALIDATION_ENDPOINT, data: periodeToSave });
            } else {
                setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(PERIODES_EXISTING_VALIDATION_ENDPOINT, { id: periode?.id }), data: periodeToSave });
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
            const periodeDtoFront: PeriodeDtoFront = {
                ...periode,
                dateDebut: dayjs(periode.dateDebut, APPLICATION_DATE_FORMAT),
                dateFin: dayjs(periode.dateFin, APPLICATION_DATE_FORMAT),
                anneeDebut: dayjs().set("year", periode.anneeDebut),
                anneeFin: dayjs().set("year", periode.anneeFin),
            };
            form.setFieldsValue(periodeDtoFront);
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

    const apiCallbacks: ApiCallbacks = {
        [`PUT:${PERIODES_EXISTING_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "La période a bien été modifiée", type: "success" });
            close();
            resetApi();
        },
        [`POST:${PERIODES_ENDPOINT}`]: (result: any) => {
            notification.open({ message: "La période a bien été créée", type: "success" });
            close();
            resetApi();
        },
        [`POST:${PERIODES_VALIDATION_ENDPOINT}`]: (result: any) => {
            const resultAsValidationResult = result as PeriodeValidationResultDto;
            if (resultAsValidationResult.success) {
                setApiCallDefinition({ method: "POST", url: PERIODES_ENDPOINT, data: resultAsValidationResult.periode });
            } else {
                setError(getErrorLabel(resultAsValidationResult.errorCode));
                resetApi();
            }
        },
        [`PUT:${PERIODES_EXISTING_VALIDATION_ENDPOINT}`]: (result: any) => {
            const resultAsValidationResult = result as PeriodeValidationResultDto;
            if (resultAsValidationResult.success) {
                setApiCallDefinition({ method: "PUT", url: buildUrlWithParams(PERIODES_EXISTING_ENDPOINT, { id: periode?.id }), data: resultAsValidationResult.periode });
            } else {
                setError(getErrorLabel(resultAsValidationResult.errorCode));
                resetApi();
            }
        }
    };

    useEffect(() => {
        const { method, url } = { ...apiCallDefinition };
        if (method && url) {
            const callBack = handleApiCall(method, url, apiCallbacks);
            if (callBack) {
                callBack(result);
            }
        }
    }, [result]);

    function onAnneeDebutSelected(value: Dayjs | null) {
        if (value) {
            // Période d'inscriptions 01.05 au 30.09 de l'année
            const dateDebutPeriode = value.set("month", 4).set("date", 1);
            const dateFinPeriode = value.set("month", 8).set("date", 30);
            form.setFieldValue("anneeFin", value.add(1, "year"));
            form.setFieldValue("dateDebut", dateDebutPeriode);
            form.setFieldValue("dateFin", dateFinPeriode);
        }
    }


    return (<Modal title={getTitre()} open={open} width={600} onCancel={close}
        footer={<><Button onClick={close}>Annuler</Button><Button onClick={onValider} danger>Valider</Button></>}>
        <Form
            name="periode"
            autoComplete="off"
            form={form}
        >
            <Spin spinning={isLoading}>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <DatePickerFormItem label="Début année scolaire" name="anneeDebut" picker="year" onChange={onAnneeDebutSelected} />
                    </Col>
                    <Col span={12}>
                        <DatePickerFormItem label="Fin année scolaire" name="anneeFin" picker="year" />
                    </Col>
                </Row>
                <Row gutter={[16, 32]}>
                    <Col span={12}>
                        <DatePickerFormItem label="Début inscription" name="dateDebut" />
                    </Col>
                    <Col span={12}>
                        <DatePickerFormItem label="Fin inscription" name="dateFin" />
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