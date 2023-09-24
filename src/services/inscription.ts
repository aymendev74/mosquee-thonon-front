import moment from "moment";

export type Inscription = {
    id: number;
    nom: string;
    prenom: string;
    dateNaissance: string | moment.Moment;
    telephone: string;
    email: string;
}