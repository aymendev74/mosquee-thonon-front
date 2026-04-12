import { useState } from "react";
import { Spin } from "antd";
import { useMediaQuery } from 'react-responsive';
import { EuroCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/AuthContext";
import { ModaleConfirmSuppressionInscription } from "../../components/modals/ModalConfirmSuppressionInscription";
import exportToExcel, { ExcelColumnHeadersType } from "../../utils/FormUtils";
import { AdhesionLight } from "../../services/adhesion";
import { useAdhesionManagement } from "./adhesion/hooks/useAdhesionManagement";
import { AdhesionMobileView } from "./adhesion/AdhesionMobileView";
import { AdhesionDesktopView } from "./adhesion/AdhesionDesktopView";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { BatchLockAlert } from "../../components/common/BatchLockAlert";

export const AdminAdhesion = () => {
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const { roles } = useAuth();

    const {
        dataSource,
        selectedAdhesions,
        setSelectedAdhesions,
        isLoading,
        searchAdhesions,
        validateAdhesion,
        validateAdhesions,
        deleteAdhesion,
        deleteAdhesions,
        batchLockConflict,
        setBatchLockConflict,
    } = useAdhesionManagement();

    const excelColumnHeaders: ExcelColumnHeadersType<AdhesionLight> = {
        nom: "Nom",
        prenom: "Prénom",
        ville: "Ville",
        montant: "Montant",
        statut: "Statut",
        dateInscription: "Date adhésion",
    };

    const exportData = () => {
        if (dataSource) {
            exportToExcel<AdhesionLight>(dataSource, excelColumnHeaders, `adhesion.xlsx`);
        }
    };

    const handleDeleteAdhesions = async () => {
        setModaleConfirmSuppressionOpen(false);
        await deleteAdhesions(selectedAdhesions);
    };

    return roles?.includes("ROLE_ADMIN") || roles?.includes("ROLE_TRESORIER") ? (
        <div className="centered-content">
            <div className="container-full-width">
                <h2 className="adhesion-title">
                    <EuroCircleOutlined /> Administration des adhésions
                </h2>

                <BatchLockAlert
                    show={batchLockConflict.show}
                    resourceType={batchLockConflict.resourceType}
                    username={batchLockConflict.username}
                    expiresAt={batchLockConflict.expiresAt}
                />

                <Spin spinning={isLoading}>
                    <div className="search-result-container">
                        {isMobile ? (
                            <AdhesionMobileView
                                dataSource={dataSource}
                                selectedAdhesions={selectedAdhesions}
                                setSelectedAdhesions={setSelectedAdhesions}
                                onValidateAdhesion={validateAdhesion}
                                onValidateAdhesions={validateAdhesions}
                                onDeleteAdhesion={deleteAdhesion}
                                onDeleteAdhesions={async (adhesions) => { setModaleConfirmSuppressionOpen(true); }}
                                onSearch={searchAdhesions}
                                onExport={exportData}
                            />
                        ) : (
                            <AdhesionDesktopView
                                dataSource={dataSource}
                                selectedAdhesions={selectedAdhesions}
                                setSelectedAdhesions={setSelectedAdhesions}
                                onValidateAdhesion={validateAdhesion}
                                onValidateAdhesions={validateAdhesions}
                                onDeleteAdhesion={deleteAdhesion}
                                onDeleteAdhesions={async (adhesions) => { setModaleConfirmSuppressionOpen(true); }}
                                onSearch={searchAdhesions}
                                onExport={exportData}
                            />
                        )}
                    </div>

                    <ModaleConfirmSuppressionInscription
                        open={modaleConfirmSuppressionOpen}
                        setOpen={setModaleConfirmSuppressionOpen}
                        nbInscriptions={selectedAdhesions.length}
                        onConfirm={handleDeleteAdhesions}
                    />
                </Spin>
            </div>
        </div>
    ) : <UnahtorizedAccess />;
}