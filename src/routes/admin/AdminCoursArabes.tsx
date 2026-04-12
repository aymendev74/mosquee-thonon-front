import { FunctionComponent, useState } from "react";
import { InscriptionLight } from "../../services/inscription";
import { useLocation } from "react-router-dom";
import { Spin, Modal } from "antd";
import { ExclamationCircleFilled, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useMediaQuery } from 'react-responsive';
import { ModaleConfirmSuppressionInscription } from "../../components/modals/ModalConfirmSuppressionInscription";
import exportToExcel, { ExcelColumnHeadersType } from "../../utils/FormUtils";
import { useAuth } from "../../hooks/AuthContext";
import { useInscriptionManagement } from "./cours/hooks/useInscriptionManagement";
import { InscriptionMobileView } from "./cours/InscriptionMobileView";
import { InscriptionDesktopView } from "./cours/InscriptionDesktopView";
import { UnahtorizedAccess } from "../public/UnahtorizedAccess";
import { BatchLockAlert } from "../../components/common/BatchLockAlert";

export const AdminCoursArabes: FunctionComponent = () => {
    const location = useLocation();
    const application = location.state?.application;
    const type = application === "COURS_ADULTE" ? "ADULTE" : "ENFANT";
    const { roles } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [modaleConfirmSuppressionOpen, setModaleConfirmSuppressionOpen] = useState<boolean>(false);
    const icon = type === "ENFANT" ? <TeamOutlined /> : <UserOutlined />;

    const {
        dataSource,
        selectedInscriptions,
        setSelectedInscriptions,
        periodesOptions,
        isLoading,
        searchInscriptions,
        validateInscription,
        validateInscriptions,
        deleteInscription,
        deleteInscriptions,
        getSelectedInscriptionDistinctIds,
        batchLockConflict,
        setBatchLockConflict,
    } = useInscriptionManagement({ application, type });

    let excelColumnHeaders: ExcelColumnHeadersType<InscriptionLight> = {
        nom: "Nom élève",
        prenom: "Prénom élève",
        dateNaissance: "Date naissance",
        niveauInterne: "Niveau interne",
        mobile: "Tél.",
        email: "E-mail",
        ville: "Ville",
        noInscription: "Numéro inscription",
        dateInscription: "Date d'inscription",
    };

    if (application === "COURS_ENFANT") {
        excelColumnHeaders = {
            ...excelColumnHeaders,
            niveau: "Niveau publique",
            nomResponsableLegal: "Nom responsable légal",
            prenomResponsableLegal: "Prénom responsable légal",
            nomContactUrgence: "Nom autre contact",
            prenomContactUrgence: "Prénom autre contact",
            mobileContactUrgence: "Tél. autre contact",
            autorisationAutonomie: "Autorisation à rentrer seul",
            autorisationMedia: "Autorisation photos/vidéos",
        }
    }

    const exportData = () => {
        if (dataSource) {
            exportToExcel<InscriptionLight>(dataSource, excelColumnHeaders, `inscriptions-${type}`);
        }
    };

    const handleDeleteInscription = async (inscriptionId: number) => {
        Modal.confirm({
            title: "Attention",
            icon: <ExclamationCircleFilled />,
            content: (
                <div>
                    <p>Vous êtes sur le point de supprimer cette inscription.</p>
                    <p>Cette action entraînera la <strong>suppression définitive</strong> de :</p>
                    <ul>
                        <li>Toutes les données liées à cette inscription</li>
                        <li>Les élèves rattachés à cette inscription</li>
                        <li>Les bulletins associés</li>
                    </ul>
                    <p><strong>Cette action est irréversible.</strong></p>
                </div>
            ),
            okText: "Supprimer",
            okType: "danger",
            cancelText: "Annuler",
            onOk: () => deleteInscription(inscriptionId),
        });
    };

    const handleDeleteInscriptions = async () => {
        setModaleConfirmSuppressionOpen(false);
        await deleteInscriptions(selectedInscriptions);
    }

    return roles?.includes("ROLE_ADMIN") ? (
        <div className="centered-content">
            <div className="container-full-width">
                <Spin spinning={isLoading}>
                    <h2 className={type === "ENFANT" ? "insc-enfant-title" : "insc-adulte-title"}>
                        {icon} Administration des inscriptions {type === "ENFANT" ? "enfant" : "adulte"}
                    </h2>

                    <BatchLockAlert
                        show={batchLockConflict.show}
                        resourceType={batchLockConflict.resourceType}
                        username={batchLockConflict.username}
                        expiresAt={batchLockConflict.expiresAt}
                    />

                    <div className="search-result-container">
                        {isMobile ? (
                            <InscriptionMobileView
                                application={application}
                                type={type}
                                dataSource={dataSource}
                                selectedInscriptions={selectedInscriptions}
                                setSelectedInscriptions={setSelectedInscriptions}
                                periodesOptions={periodesOptions}
                                onValidateInscription={validateInscription}
                                onValidateInscriptions={validateInscriptions}
                                onDeleteInscription={handleDeleteInscription}
                                onDeleteInscriptions={async (inscriptions) => { setModaleConfirmSuppressionOpen(true); }}
                                onSearch={searchInscriptions}
                                onExport={exportData}
                            />
                        ) : (
                            <InscriptionDesktopView
                                application={application}
                                type={type}
                                dataSource={dataSource}
                                selectedInscriptions={selectedInscriptions}
                                setSelectedInscriptions={setSelectedInscriptions}
                                periodesOptions={periodesOptions}
                                onValidateInscription={validateInscription}
                                onValidateInscriptions={validateInscriptions}
                                onDeleteInscription={handleDeleteInscription}
                                onDeleteInscriptions={async (inscriptions) => { setModaleConfirmSuppressionOpen(true); }}
                                onSearch={searchInscriptions}
                                onExport={exportData}
                            />
                        )}
                    </div>

                    <ModaleConfirmSuppressionInscription
                        open={modaleConfirmSuppressionOpen}
                        setOpen={setModaleConfirmSuppressionOpen}
                        nbInscriptions={getSelectedInscriptionDistinctIds().length}
                        onConfirm={handleDeleteInscriptions}
                    />
                </Spin>
            </div>
        </div>
    ) : <UnahtorizedAccess />
};