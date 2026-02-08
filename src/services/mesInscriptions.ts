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
});

export type ResponsableLegalDto = z.infer<typeof ResponsableLegalDtoSchema>;

export const EleveAvecAutorisationsDtoSchema = z.object({
    id: z.number().optional(),
    nom: z.string(),
    prenom: z.string(),
    dateNaissance: z.string(),
    niveau: z.string(),
    niveauInterne: z.string().nullable().optional(),
    classeId: z.number().nullable().optional(),
    resultat: z.string().nullable().optional(),
    autorisationAutonomie: z.boolean().nullable(),
    autorisationMedia: z.boolean().nullable(),
});

export type EleveAvecAutorisationsDto = z.infer<typeof EleveAvecAutorisationsDtoSchema>;

export const InscriptionParAnneeScolaireDtoSchema = z.object({
    anneeDebut: z.number(),
    anneeFin: z.number(),
    noInscription: z.string(),
    statut: z.nativeEnum(StatutInscription),
    montantTotal: z.number(),
    responsableLegal: ResponsableLegalDtoSchema,
    eleves: z.array(EleveAvecAutorisationsDtoSchema),
});

export type InscriptionParAnneeScolaireDto = z.infer<typeof InscriptionParAnneeScolaireDtoSchema>;

export const MesInscriptionsSchema = z.array(InscriptionParAnneeScolaireDtoSchema);
