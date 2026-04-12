import { z } from "zod";
import { StatutInscription } from "./inscription";

export const ResponsableLegalDtoSchema = z.object({
    nom: z.string(),
    prenom: z.string(),
    email: z.string(),
    mobile: z.string(),
    numeroEtRue: z.string(),
    codePostal: z.number(),
    ville: z.string(),
    nomAutre: z.string().nullable(),
    prenomAutre: z.string().nullable(),
    lienParente: z.string().nullable(),
    telephoneAutre: z.string().nullable(),
    autorisationAutonomie: z.boolean().nullable(),
    autorisationMedia: z.boolean().nullable(),
});

export type ResponsableLegalDto = z.infer<typeof ResponsableLegalDtoSchema>;

export const EleveDtoSchema = z.object({
    id: z.number().optional(),
    nom: z.string(),
    prenom: z.string(),
    dateNaissance: z.string(),
    niveau: z.string(),
    niveauInterne: z.string().nullable().optional(),
    classeId: z.number().nullable().optional(),
    resultat: z.string().nullable().optional(),
});

export type EleveDto = z.infer<typeof EleveDtoSchema>;

export const InscriptionEnfantParAnneeScolaireDtoSchema = z.object({
    anneeDebut: z.number(),
    anneeFin: z.number(),
    noInscription: z.string(),
    statut: z.nativeEnum(StatutInscription),
    montantTotal: z.number(),
    responsableLegal: ResponsableLegalDtoSchema,
    eleves: z.array(EleveDtoSchema),
    idDocument: z.number().optional(),
});

export type InscriptionEnfantParAnneeScolaireDto = z.infer<typeof InscriptionEnfantParAnneeScolaireDtoSchema>;

export const InscriptionAdulteParAnneeScolaireDtoSchema = z.object({
    anneeDebut: z.number(),
    anneeFin: z.number(),
    noInscription: z.string(),
    statut: z.nativeEnum(StatutInscription),
    montantTotal: z.number(),
    nom: z.string(),
    prenom: z.string(),
    email: z.string(),
    dateNaissance: z.string(),
    mobile: z.string(),
    numeroEtRue: z.string(),
    codePostal: z.number(),
    ville: z.string(),
    sexe: z.string(),
    niveauInterne: z.string(),
    statutProfessionnel: z.string(),
    matieres: z.array(z.string()),
    idDocument: z.number().optional(),
});

export type InscriptionAdulteParAnneeScolaireDto = z.infer<typeof InscriptionAdulteParAnneeScolaireDtoSchema>;

export const MesInscriptionsDtoSchema = z.object({
    inscriptionsEnfants: z.array(InscriptionEnfantParAnneeScolaireDtoSchema),
    inscriptionsAdultes: z.array(InscriptionAdulteParAnneeScolaireDtoSchema),
});

export type MesInscriptionsDto = z.infer<typeof MesInscriptionsDtoSchema>;
