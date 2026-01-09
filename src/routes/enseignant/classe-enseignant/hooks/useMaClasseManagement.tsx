import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { notification, Tooltip, Button } from 'antd';
import { FilePdfTwoTone } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import useApi from '../../../../hooks/useApi';
import { useMatieresStore } from '../../../../components/stores/useMatieresStore';
import {
    buildUrlWithParams,
    EXISTING_CLASSES_ENDPOINT,
    FEUILLE_PRESENCE_ENDPOINT,
    ELEVES_ENRICHED_ENDPOINT,
    ELEVES_ENDPOINT,
    EXISTING_FEUILLE_PRESENCE_ENDPOINT,
    BULLETINS_ELEVE_ENDPOINT,
    BULLETIN_EXISTING_ENDPOINT,
} from '../../../../services/services';
import {
    ClasseDtoB,
    ClasseDtoF,
    FeuillePresenceDtoB,
    FeuillePresenceDtoF,
    BulletinDtoB,
    BulletinDtoF,
    TypeMatiereEnum,
} from '../../../../services/classe';
import {
    prepareClasseBeforeForm,
    prepareFeuillePresenceBeforeForm,
    prepareBulletinBeforeForm,
    ExcelColumnHeadersType,
} from '../../../../utils/FormUtils';
import { EleveEnrichedDto, PatchEleve, ResultatEnum } from '../../../../services/eleve';
import exportToExcel from '../../../../utils/FormUtils';
import { getJourActiviteOptions } from '../../../../components/common/commoninputs';
import { PdfAuthContextBridge } from '../../../../components/documents/PdfContextBridge';
import { PdfBulletin } from '../../../../components/documents/PdfBulletin';

export const useMaClasseManagement = () => {    
    const { execute } = useApi();
    const { id } = useParams();
    const { getMatieresByType } = useMatieresStore();

    const [modalFeuillePresenceOpen, setModalFeuillePresenceOpen] = useState(false);
    const [modalBulletinOpen, setModalBulletinOpen] = useState(false);
    const [classe, setClasse] = useState<ClasseDtoF | undefined>();
    const [feuillesPresence, setFeuillesPresence] = useState<FeuillePresenceDtoF[]>([]);
    const [feuilleToView, setFeuilleToView] = useState<FeuillePresenceDtoF | undefined>();
    const [feuilleToViewReadOnly, setFeuilleToViewReadOnly] = useState<boolean>(false);
    const [elevesEnriched, setElevesEnriched] = useState<EleveEnrichedDto[]>([]);
    const [vueDetaille, setVueDetaille] = useState(false);
    const [bulletins, setBulletins] = useState<BulletinDtoF[]>([]);
    const [selectedEleveId, setSelectedEleveId] = useState<number | undefined>();
    const [bulletin, setBulletin] = useState<BulletinDtoF | undefined>();
    const [bulletinsPdf, setBulletinsPdf] = useState<number[]>([]);

    const onCreateFeuillePresence = () => {
        setFeuilleToView(undefined);
        setModalFeuillePresenceOpen(true);
        setFeuilleToViewReadOnly(false);
    };

    const loadClasse = async () => {
        const { successData: classe } = await execute<ClasseDtoB>({ method: "GET", url: buildUrlWithParams(EXISTING_CLASSES_ENDPOINT, { id }) });
        if (classe) {
            const classesF = prepareClasseBeforeForm(classe);
            setClasse(classesF);
        }
    };

    const loadFeuillesPresence = async () => {
        const { successData: feuillesPresence } = await execute<FeuillePresenceDtoB[]>({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id }) });
        if (feuillesPresence) {
            const feuillesPresenceF = feuillesPresence.map(feuille => prepareFeuillePresenceBeforeForm(feuille));
            setFeuillesPresence(feuillesPresenceF);
        }
    };

    const loadElevesEnriched = async () => {
        const { successData: elevesEnriched } = await execute<EleveEnrichedDto[]>({ method: "GET", url: ELEVES_ENRICHED_ENDPOINT, params: { idClasse: id } });
        if (elevesEnriched) {
            setElevesEnriched(elevesEnriched);
        }
    };

    useEffect(() => {
        if (!modalFeuillePresenceOpen) {
            loadClasse();
            loadFeuillesPresence();
            loadElevesEnriched();
        }
    }, [modalFeuillePresenceOpen]);

    useEffect(() => {
        const loadBulletinsEleve = async () => {
            const { successData: bulletins } = await execute<BulletinDtoB[]>({ method: "GET", url: buildUrlWithParams(BULLETINS_ELEVE_ENDPOINT, { id: selectedEleveId }) });
            if (bulletins) {
                let bulletinsF = bulletins.map((bulletin) => prepareBulletinBeforeForm(bulletin));
                setBulletins(bulletinsF);
            }
        }
        if (!modalBulletinOpen && selectedEleveId) {
            loadBulletinsEleve();
        }
    }, [modalBulletinOpen]);

    const getJourClasse = (): string | undefined => {
        if (classe?.activites) {
            const jour = classe.activites[0].jour;
            return getJourActiviteOptions().find((option) => option.value === jour)?.label as string | undefined;
        }
        return "";
    };

    const onViewFeuille = (feuillePresence: FeuillePresenceDtoF, readOnly: boolean) => {
        setFeuilleToView(feuillePresence);
        setFeuilleToViewReadOnly(readOnly);
        setModalFeuillePresenceOpen(true);
    };

    const onDeleteFeuille = async (feuillePresence: FeuillePresenceDtoF) => {
        const { success } = await execute({ method: "DELETE", url: buildUrlWithParams(EXISTING_FEUILLE_PRESENCE_ENDPOINT, { id: feuillePresence.id }) });
        if (success) {
            notification.success({ message: "La feuille de temps a bien été supprimée" });
            const { successData: feuillesPresencesB } = await execute<FeuillePresenceDtoB[]>({ method: "GET", url: buildUrlWithParams(FEUILLE_PRESENCE_ENDPOINT, { id: classe?.id }) });
            if (feuillesPresencesB) {
                setFeuillesPresence(feuillesPresencesB.map((feuillePresence) => prepareFeuillePresenceBeforeForm(feuillePresence)));
            }
            const { successData: elevesEnriched } = await execute<EleveEnrichedDto[]>({ method: "GET", url: ELEVES_ENRICHED_ENDPOINT, params: { idClasse: id } });
            if (elevesEnriched) {
                setElevesEnriched(elevesEnriched);
            }
        }
    };

    const onModifierResultat = (eleveId: number, resultat: ResultatEnum) => {
        setElevesEnriched(elevesEnriched.map((eleveEnriched) => eleveEnriched.id === eleveId ? { ...eleveEnriched, resultat } : eleveEnriched));
    };

    const excelColumnHeaders: ExcelColumnHeadersType<EleveEnrichedDto> = {
        nom: "Nom",
        prenom: "Prénom",
        dateNaissance: "Date naissance",
        niveauInterne: "Niveau",
        nomResponsableLegal: "Nom resp. légal",
        prenomResponsableLegal: "Prénom resp. légal",
        mobile: "Tél.",
        nomContactUrgence: "Nom contact urgence",
        prenomContactUrgence: "Prénom contact urgence",
        mobileContactUrgence: "Tél. contact urgence",
        autorisationMedia: "Autor. photos/vidéos",
        autorisationAutonomie: "Autor. à rentrer seul",
    };

    const exportData = () => {
        if (elevesEnriched) {
            exportToExcel<EleveEnrichedDto>(elevesEnriched, excelColumnHeaders, `eleves_${classe?.libelle}`);
        }
    };

    const onEnregistrerResultat = async () => {
        if (elevesEnriched.length > 0) {
            const patchesEleves: PatchEleve[] = elevesEnriched.map(eleve => ({ id: eleve.id, resultat: eleve.resultat }));
            const { success } = await execute({ method: "PATCH", url: ELEVES_ENDPOINT, data: { eleves: patchesEleves } });
            if (success) {
                notification.success({ message: "Les résultats des élèves ont bien été enregistrés" });
            }
            loadClasse();
        }
    };

    const onVueDetailleSwitch = (checked: boolean) => {
        setVueDetaille(checked);
        const classeContainerDiv = document.querySelector('.classe-container') as HTMLDivElement;
        if (classeContainerDiv) {
            if (checked) {
                classeContainerDiv.style.gridTemplateColumns = '70% 1fr';
            } else {
                classeContainerDiv.style.gridTemplateColumns = '40% 1fr';
            }
        }
    };

    const getTauxReussite = (): string | JSX.Element => {
        const eleveSansResultat = elevesEnriched.find(eleve => !eleve.resultat);
        if (eleveSansResultat) {
            return <Tooltip title="Le taux de réussite est calculé lorsque les résultats de tous les élèves sont saisis">Pas disponible</Tooltip>
        } else {
            const eleveNiveauAcquis = elevesEnriched.filter(eleve => eleve.resultat == ResultatEnum.ACQUIS).length;
            const eleveNiveauNonAcquis = elevesEnriched.filter(eleve => eleve.resultat == ResultatEnum.NON_ACQUIS).length;
            return `${(eleveNiveauAcquis / (eleveNiveauAcquis + eleveNiveauNonAcquis) * 100).toFixed(2)}%`;
        }
    };

    const loadBulletinsEleve = async (eleveId: number) => {
        setSelectedEleveId(eleveId);
        if (eleveId) {
            const { successData: bulletinsEleve } = await execute<BulletinDtoB[]>({ method: "GET", url: buildUrlWithParams(BULLETINS_ELEVE_ENDPOINT, { id: eleveId }) });
            if (bulletinsEleve) {
                let bulletinsF = bulletinsEleve.map((bulletin) => prepareBulletinBeforeForm(bulletin));
                setBulletins(bulletinsF);
            }
        } else {
            setBulletins([]);
        }
    };

    const onModifierBulletin = (bulletinId: number) => {
        setModalBulletinOpen(true);
        setBulletin(bulletins.find(bulletin => bulletin.id === bulletinId));
    };

    const onDeleteBulletin = async (bulletinId: number) => {
        const { success } = await execute({ method: "DELETE", url: buildUrlWithParams(BULLETIN_EXISTING_ENDPOINT, { id: bulletinId }) });
        if (success) {
            notification.success({ message: "Le bulletin a bien été supprimé" });
        }
        if (selectedEleveId) {
            loadBulletinsEleve(selectedEleveId);
        }
    };

    const getBulletinById = (id: number) => bulletins.find(bulletin => bulletin.id === id);

    const getBulletinPdfButton = (id: number) => {
        return bulletinsPdf.some(idBulletin => idBulletin === id) ?
            (
                <PDFDownloadLink className="m-left-10" document={<PdfAuthContextBridge>
                    <PdfBulletin bulletin={getBulletinById(id)!}
                        eleve={elevesEnriched.find(eleve => eleve.id === getBulletinById(id)?.idEleve)!} 
                        matieres={getMatieresByType(TypeMatiereEnum.ENFANT)}
                        nomPrenomEnseignant={classe?.nomPrenomEnseignant ?? ""} 
                        nomClasse={classe?.libelle ?? ""} />
                </PdfAuthContextBridge>}
                    fileName="bulletin">
                    {({ blob, url, loading, error }) => {
                        return loading ? "Génération Pdf..." : <FilePdfTwoTone />
                    }}
                </PDFDownloadLink>
            ) : (
                <Button className="m-left-10" type="primary" onClick={() => { setBulletinsPdf([...bulletinsPdf, id]) }} icon={<FilePdfTwoTone />} />
            )
    };

    const onCreerBulletin = () => {
        setModalBulletinOpen(true);
        setBulletin({ idEleve: selectedEleveId! });
    };

    const getSelectedEleve = () => {
        return elevesEnriched.find(eleve => eleve.id === selectedEleveId);
    };

    return {
        // States
        classe,
        elevesEnriched,
        feuillesPresence,
        bulletins,
        selectedEleveId,
        vueDetaille,
        bulletinsPdf,
        modalFeuillePresenceOpen,
        setModalFeuillePresenceOpen,
        feuilleToView,
        feuilleToViewReadOnly,
        modalBulletinOpen,
        setModalBulletinOpen,
        bulletin,
        
        // Actions
        onCreateFeuillePresence,
        onViewFeuille,
        onDeleteFeuille,
        onVueDetailleSwitch,
        exportData,
        onModifierResultat,
        onEnregistrerResultat,
        loadBulletinsEleve,
        onCreerBulletin,
        onModifierBulletin,
        onDeleteBulletin,
        getBulletinPdfButton,
        getTauxReussite,
        getJourClasse,
        getSelectedEleve,
    };
};
