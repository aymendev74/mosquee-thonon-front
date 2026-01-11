import { Form, Spin } from "antd";
import { FunctionComponent } from "react";
import { useMediaQuery } from 'react-responsive';
import { EuroCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/AuthContext";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { useTarifManagement } from "./tarifs/hooks/useTarifManagement";
import { TarifMobileView } from "./tarifs/TarifMobileView";
import { TarifDesktopView } from "./tarifs/TarifDesktopView";

export const AdminTarifs: FunctionComponent = () => {
    const { roles } = useAuth();
    const [form] = Form.useForm();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const {
        periodesDto,
        periodesOptions,
        selectedIdPeriode,
        viewTarif,
        openPopOver,
        application,
        currentPage,
        modalPeriodeOpen,
        createPeriode,
        periodeToEdit,
        isLoading,
        setCurrentPage,
        setOpenPopOver,
        setModalPeriodeOpen,
        onCreatePeriode,
        onModifierPeriode,
        onDeletePeriode,
        isSelectedPeriodeReadOnly,
        copierTarif,
        onFinish,
        onSelectPeriode,
        onApplicationChange,
    } = useTarifManagement(form);

    return roles?.includes("ROLE_ADMIN") ? (
        <div className="centered-content">
            <Form
                name="basic"
                autoComplete="off"
                className="container-full-width"
                onFinish={onFinish}
                form={form}
            >
                <Spin spinning={isLoading}>
                    <h2 className="admin-tarif-title">
                        <EuroCircleOutlined /> Administration des tarifs
                    </h2>
                    {isMobile ? (
                        <TarifMobileView
                            form={form}
                            application={application}
                            periodesDto={periodesDto}
                            periodesOptions={periodesOptions}
                            selectedIdPeriode={selectedIdPeriode}
                            viewTarif={viewTarif}
                            currentPage={currentPage}
                            openPopOver={openPopOver}
                            modalPeriodeOpen={modalPeriodeOpen}
                            createPeriode={createPeriode}
                            periodeToEdit={periodeToEdit}
                            onApplicationChange={onApplicationChange}
                            onSelectPeriode={onSelectPeriode}
                            onCreatePeriode={onCreatePeriode}
                            onModifierPeriode={onModifierPeriode}
                            onDeletePeriode={onDeletePeriode}
                            onFinish={onFinish}
                            onCopierTarif={copierTarif}
                            setCurrentPage={setCurrentPage}
                            setOpenPopOver={setOpenPopOver}
                            setModalPeriodeOpen={setModalPeriodeOpen}
                            isSelectedPeriodeReadOnly={isSelectedPeriodeReadOnly}
                        />
                    ) : (
                        <TarifDesktopView
                            form={form}
                            application={application}
                            periodesDto={periodesDto}
                            periodesOptions={periodesOptions}
                            selectedIdPeriode={selectedIdPeriode}
                            viewTarif={viewTarif}
                            currentPage={currentPage}
                            openPopOver={openPopOver}
                            modalPeriodeOpen={modalPeriodeOpen}
                            createPeriode={createPeriode}
                            periodeToEdit={periodeToEdit}
                            onApplicationChange={onApplicationChange}
                            onSelectPeriode={onSelectPeriode}
                            onCreatePeriode={onCreatePeriode}
                            onModifierPeriode={onModifierPeriode}
                            onDeletePeriode={onDeletePeriode}
                            onFinish={onFinish}
                            onCopierTarif={copierTarif}
                            setCurrentPage={setCurrentPage}
                            setOpenPopOver={setOpenPopOver}
                            setModalPeriodeOpen={setModalPeriodeOpen}
                            isSelectedPeriodeReadOnly={isSelectedPeriodeReadOnly}
                        />
                    )}
                </Spin>
            </Form>
        </div>
    ) : <UnahtorizedAccess />;
};