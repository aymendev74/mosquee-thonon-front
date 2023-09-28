import { Modal } from "antd";
import { AxiosInstance } from "./AxiosConfig";
import { ApiCallDefinition } from "./useApi";

export const AUTHENTIFICATION_ENDPOINT = "auth/login/";
export const INSCRIPTION_ENDPOINT = "inscriptions/";

enum HttpErrors {
    HTTP_401 = 401,
}

export const executeApiCall = async (apiCallDefinition: ApiCallDefinition): Promise<any> => {
    return AxiosInstance.request({
        ...apiCallDefinition
    }).then(response => {
        return response.data;
    }).catch(function (error) {
        if (error.response.status === HttpErrors.HTTP_401) {
            Modal.error({
                title: "Erreur",
                content: "Veuillez vous reconnecter",
            });
        }
        throw error;
    });
}