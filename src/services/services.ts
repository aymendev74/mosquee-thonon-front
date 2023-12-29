import { notification } from "antd";
import { AxiosInstance } from "./AxiosConfig";
import { ApiCallDefinition } from "../hooks/useApi";

export const AUTHENTIFICATION_ENDPOINT = "user/auth";
export const CHANGE_PASSWORD_ENDPOINT = "user/password";
export const INSCRIPTION_ENDPOINT = "inscriptions";
export const ADHESION_ENDPOINT = "adhesions";
export const VALIDATION_ENDPOINT = "inscriptions/validation";
export const INSCRIPTION_TARIFS_ENDPOINT = "tarifs-inscription";
export const TARIFS_ENDPOINT = "tarifs";

export const ERROR_INVALID_CREDENTIALS = "ERROR_INVALID_CREDENTIALS";
export const ERROR_INVALID_OLD_PASSWORD = "ERROR_INVALID_OLD_PASSWORD";

export const executeApiCall = async (apiCallDefinition: ApiCallDefinition): Promise<any> => {
    return AxiosInstance.request({
        ...apiCallDefinition
    }).then(response => {
        return response.data;
    }).catch(function (error) {
        // Si pas de code d'erreur spécifique renvoyé par le back, alors on affiche un message d'erreur standard (problème technique)
        // Sinon on ne fait rien d'autre que levé l'erreur pour que ce soit géré par l'appelant (message spécifique à afficher à l'utilisateur)
        if (!error.response.data) {
            notification.open({ message: "Une erreur est survenue", type: "error" });
        }
        throw error;
    });
}