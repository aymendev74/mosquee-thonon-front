export type ResponsableLegal<T extends boolean | string> = {
    id: number;
    nom: string;
    prenom: string;
    mobile: string;
    email: string;
    numeroEtRue: string;
    codePostal: number;
    ville: string;
    idTarif: number;
    adherent: boolean;
    autorisationAutonomie: T;
    autorisationMedia: T;
    nomAutre: string;
    prenomAutre: string;
    lienParente: string;
    telephoneAutre: string;
}

export type ResponsableLegalFront = ResponsableLegal<string>;
export type ResponsableLegalBack = ResponsableLegal<boolean>;