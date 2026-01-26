import { Button, Form, Result, Spin, Steps } from "antd";
import { FunctionComponent } from "react";
import { StatutInscription } from "../../services/inscription";
import { useForm } from "antd/es/form/Form";
import { ModaleRGPD } from "../../components/modals/ModalRGPD";
import { ResponsableLegal } from "../../components/inscriptions/ResponsableLegal";
import { Tarif } from "../../components/inscriptions/Tarif";
import { Eleves } from "../../components/inscriptions/Eleves";
import { CheckOutlined, EuroCircleOutlined, InfoCircleOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useCoursArabesEnfantManagement } from "./hooks/useCoursArabesEnfantManagement";
import { LockAlert } from "../../components/common/LockAlert";

export const CoursArabesEnfantForm: FunctionComponent = () => {
    const [form] = useForm();

    const {
        isLoading,
        modalRGPDOpen,
        setModalRGPDOpen,
        consentementChecked,
        setConsentementChecked,
        eleves,
        setEleves,
        tarifInscription,
        inscriptionFinished,
        setInscriptionFinished,
        isOnlyReinscriptionEnabled,
        isInscriptionsFermees,
        activeStep,
        id,
        isReadOnly,
        isAdmin,
        lockStatus,
        calculTarif,
        onPreviousStep,
        onNextStep,
        onFinish,
        onFinishFailed,
    } = useCoursArabesEnfantManagement({ form });

    const steps = [
        {
            title: 'Responsable',
            icon: <InfoCircleOutlined />,
            content: <ResponsableLegal isReadOnly={isReadOnly} isAdmin={isAdmin} doCalculTarif={calculTarif} onNextStep={onNextStep} form={form} />,
        },
        {
            title: 'Élèves',
            icon: <UserOutlined />,
            content: <Eleves isReadOnly={isReadOnly} isAdmin={isAdmin} form={form} eleves={eleves} setEleves={setEleves} onPreviousStep={onPreviousStep}
                onNextStep={onNextStep} />,
        },
        {
            title: 'Tarif',
            icon: <EuroCircleOutlined />,
            content: <Tarif eleves={eleves} tarifInscription={tarifInscription} form={form} isAdmin={isAdmin} isReadOnly={isReadOnly}
                onPreviousStep={onPreviousStep} consentementChecked={consentementChecked} setConsentementChecked={setConsentementChecked}
                isReinscriptionOnlyEnabled={isOnlyReinscriptionEnabled} />,
        }
    ];

    const getResult = () => {
        if (inscriptionFinished?.statut === StatutInscription.REFUSE) {
            return (<Result
                status="error"
                title="Inscription refusée"
                subTitle={(<div className="result-message">Votre inscription a été refusée car seules les réinscriptions sont actuellement autorisées. Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter l'AMC par e-mail : amcthonon@gmail.com<br />
                    Un mail récpitulatif vous a été envoyé à l'adresse e-mail indiquée.
                </div>)}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionFinished(undefined)}>
                        Nouvelle inscription
                    </Button>]}
            />);
        } else if (inscriptionFinished?.statut === StatutInscription.LISTE_ATTENTE) {
            return (<Result
                status="warning"
                title="Inscription en liste d'attente"
                subTitle={(<div className="result-message">Votre inscription a été enregistrée, cependant vous avez été placée sur liste d'attente.<br />
                    Un mail récpitulatif vous a été envoyé à l'adresse e-mail indiquée.
                </div>)}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionFinished(undefined)}>
                        Nouvelle inscription
                    </Button>]}
            />);
        } else {
            return (<Result
                status="success"
                title="Inscription enregistré"
                subTitle={<div className="result-message">Votre inscription a bien été enregistrée.<br />
                    Un mail récpitulatif vous a été envoyé à l'adresse e-mail indiquée.
                </div>}
                extra={[
                    <Button type="primary" onClick={() => setInscriptionFinished(undefined)}>
                        Nouvelle inscription
                    </Button>]}
            />);
        }
    }

    const getFormContent = () => {
        if (inscriptionFinished) {
            return getResult();
        }

        return (
            <div className="steps-container">
                <Steps
                    current={activeStep}
                    className="custom-steps"
                    direction="horizontal"
                    responsive={false}
                    items={steps.map((item, index) => ({
                        title: item.title,
                        icon: index < activeStep ? <CheckOutlined style={{ color: 'green' }} /> : item.icon,
                        status: index < activeStep ? 'finish' : index === activeStep ? 'process' : 'wait',
                    }))}
                />
                <div className="steps-content">
                    {steps[activeStep].content}
                </div>
            </div>
        );
    }

    const getInscriptionFermeesContent = () => {
        return (
            <>
                <div className="centered-content-v">
                    <div className="inscription-closed" />
                    <div className="inscription-closed-text">Les inscriptions sont actuellement fermées</div>
                </div>
            </>
        );
    }

    return isInscriptionsFermees ? getInscriptionFermeesContent() :
        (
            <div className="centered-content">
                <Form
                    name="cours"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    className="container-form"
                    form={form}
                >
                    <h2 className="insc-enfant-title">
                        <TeamOutlined /> Inscription aux cours arabes pour enfants
                    </h2>
                    <Spin spinning={isLoading} size="large" tip={"Chargement..."}>
                        <LockAlert lockStatus={lockStatus} resourceName="Cette inscription" />
                        {getFormContent()}
                        <ModaleRGPD open={modalRGPDOpen} setOpen={setModalRGPDOpen} />
                    </Spin>
                </Form >
            </div>
        );
}