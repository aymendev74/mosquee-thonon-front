import { Modal } from "antd";
import { AxiosInstance } from "./AxiosConfig";
import { Inscription } from "./inscription";

const AUTHENTIFICATION_ENDPOINT = "auth/login/";
const INSCRIPTION_ENDPOINT = "inscription/";

enum HttpErrors {
    HTTP_401 = 401,
}

export const authenticate = async (username: string, password: string): Promise<string | undefined> => {
    return AxiosInstance.request({
        method: "POST",
        url: AUTHENTIFICATION_ENDPOINT,
        data: {
            username,
            password
        }
    }).then(response => {
        return response.data.accessToken;
    }).catch(function (error) {
        console.log(error);
        if (error.response.status === HttpErrors.HTTP_401) {
            Modal.error({
                title: "Erreur d'authentification",
                content: "Vos identifiants sont incorrects",
            });
        }
        return undefined;
    });
}

export const getPersonnesInscrites = async (): Promise<Inscription[]> => {
    return AxiosInstance.request({
        method: "GET",
        url: INSCRIPTION_ENDPOINT,
    }).then(response => {
        return response.data;
    }).catch(function (error) {
        console.log(error.toJSON());
        if (error.response.status === HttpErrors.HTTP_401) {
            Modal.error({
                title: "Erreur",
                content: "Veuillez vous reconnecter",
            });
        }
        return undefined;
    });
}

export const saveInscription = async (inscription: Inscription): Promise<Inscription> => {
    return AxiosInstance.request({
        method: "POST",
        url: INSCRIPTION_ENDPOINT,
        data: inscription
    }).then(response => {
        return response.data;
    }).catch(function (error) {
        console.log(error.toJSON());
        if (error.response.status === HttpErrors.HTTP_401) {
            Modal.error({
                title: "Erreur",
                content: "Veuillez vous reconnecter",
            });
        }
        return undefined;
    });
}