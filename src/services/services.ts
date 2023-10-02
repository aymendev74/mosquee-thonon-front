import { notification } from "antd";
import { AxiosInstance } from "./AxiosConfig";
import { ApiCallDefinition } from "../hooks/useApi";

export const AUTHENTIFICATION_ENDPOINT = "auth/login/";
export const INSCRIPTION_ENDPOINT = "inscriptions/";
export const VALIDATION_ENDPOINT = "inscriptions/validation/";

export const executeApiCall = async (apiCallDefinition: ApiCallDefinition): Promise<any> => {
    return AxiosInstance.request({
        ...apiCallDefinition
    }).then(response => {
        return response.data;
    }).catch(function (error) {
        notification.open({ message: "Une erreur est survenue", type: "error" });
        throw error;
    });
}