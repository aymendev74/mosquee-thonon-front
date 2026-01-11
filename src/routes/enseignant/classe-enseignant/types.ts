import { ClasseDtoF, FeuillePresenceDtoF, BulletinDtoF } from "../../../services/classe";
import { EleveEnrichedDto, ResultatEnum } from "../../../services/eleve";

export interface MaClasseViewProps {
    classe?: ClasseDtoF;
    elevesEnriched: EleveEnrichedDto[];
    feuillesPresence: FeuillePresenceDtoF[];
    bulletins: BulletinDtoF[];
    selectedEleveId?: number;
    vueDetaille: boolean;
    bulletinsPdf: number[];
    onCreateFeuillePresence: () => void;
    onViewFeuille: (feuille: FeuillePresenceDtoF, readOnly: boolean) => void;
    onDeleteFeuille: (feuille: FeuillePresenceDtoF) => void;
    onVueDetailleSwitch: (checked: boolean) => void;
    exportData: () => void;
    onModifierResultat: (eleveId: number, resultat: ResultatEnum) => void;
    onEnregistrerResultat: () => void;
    loadBulletinsEleve: (eleveId: number) => void;
    onCreerBulletin: () => void;
    onModifierBulletin: (bulletinId: number) => void;
    onDeleteBulletin: (bulletinId: number) => void;
    getBulletinPdfButton: (id: number) => JSX.Element;
    getTauxReussite: () => string | JSX.Element;
    getJourClasse: () => string | undefined;
}
