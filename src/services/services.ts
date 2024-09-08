import { notification } from "antd";
import { AxiosInstance } from "./AxiosConfig";
import { ApiCallDefinition } from "../hooks/useApi";

export const AUTHENTIFICATION_ENDPOINT = "user/auth";
export const CHANGE_PASSWORD_ENDPOINT = "user/password";
export const INSCRIPTION_ENFANT_ENDPOINT = "inscriptions-enfants";
export const INSCRIPTION_ENDPOINT = "inscriptions";
export const INSCRIPTION_ADULTE_ENDPOINT = "inscriptions-adultes";
export const ADHESION_ENDPOINT = "adhesions";
export const VALIDATION_INSCRIPTION_ENDPOINT = "inscriptions/validation";
export const CHECK_COHERENCE_INSCRIPTION_ENDPOINT = "inscriptions-enfants/incoherences";
export const VALIDATION_ADHESION_ENDPOINT = "adhesions/validation";
export const INSCRIPTION_TARIFS_ENDPOINT = "tarifs-inscription";
export const TARIFS_ENDPOINT = "tarifs";
export const TARIFS_ADMIN_ENDPOINT = "tarifs-admin";
export const PERIODES_ENDPOINT = "periodes";
export const PERIODES_VALIDATION_ENDPOINT = "periodes/validation";
export const PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT = "params/reinscription-enabled";
export const PARAM_ENDPOINT = "params";


export const ERROR_INVALID_CREDENTIALS = "ERROR_INVALID_CREDENTIALS";
export const ERROR_INVALID_OLD_PASSWORD = "ERROR_INVALID_OLD_PASSWORD";

export type APiCallResult = {
    responseData?: any;
    status?: number;
}

export const executeApiCall = async (apiCallDefinition: ApiCallDefinition): Promise<APiCallResult> => {
    return AxiosInstance.request({
        ...apiCallDefinition,
        paramsSerializer: {
            indexes: null
        }
    }).then(response => {
        return { responseData: response.data, status: response.status };
    }).catch(function (error) {
        // Si pas de code d'erreur spécifique renvoyé par le back, alors on affiche un message d'erreur standard (problème technique)
        // Sinon on ne fait rien d'autre que levé l'erreur pour que ce soit géré par l'appelant (message spécifique à afficher à l'utilisateur)
        if (!error.response || !error.response.data) {
            notification.open({ message: "Une erreur est survenue", type: "error" });
        }
        throw error;
    });
}