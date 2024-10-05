import { HttpMethod } from "../hooks/useApi";

export const AUTHENTIFICATION_ENDPOINT = "user/auth";
export const CHANGE_PASSWORD_ENDPOINT = "user/password";
export const NEW_INSCRIPTION_ENFANT_ENDPOINT = "inscriptions-enfants";
export const INSCRIPTION_ENFANT_ENDPOINT = "inscriptions-enfants/{id}";
export const INSCRIPTION_ENDPOINT = "inscriptions";
export const INSCRIPTION_ADULTE_ENDPOINT = "inscriptions-adultes/{id}";
export const NEW_INSCRIPTION_ADULTE_ENDPOINT = "inscriptions-adultes";
export const ADHESION_ENDPOINT = "adhesions/{id}";
export const ADHESION_SEARCH_ENDPOINT = "adhesions";
export const NEW_ADHESION_ENDPOINT = "adhesions";
export const CHECK_COHERENCE_NEW_INSCRIPTION_ENDPOINT = "inscriptions-enfants/incoherences";
export const CHECK_COHERENCE_INSCRIPTION_ENDPOINT = "inscriptions-enfants/{id}/incoherences";
export const NEW_INSCRIPTION_ENFANT_TARIFS_ENDPOINT = "tarifs-inscription/enfant";
export const INSCRIPTION_ENFANT_EXISTING_TARIFS_ENDPOINT = "tarifs-inscription/enfant/{id}";
export const NEW_INSCRIPTION_ADULTE_TARIFS_ENDPOINT = "tarifs-inscription/adulte";
export const INSCRIPTION_ADULTE_EXISTING_TARIFS_ENDPOINT = "tarifs-inscription/adulte/{id}";
export const TARIFS_ENDPOINT = "tarifs";
export const TARIFS_ADMIN_ENDPOINT = "tarifs-admin";
export const TARIFS_ADMIN_GET_ENDPOINT = "tarifs-admin/{id}";
export const PERIODES_ENDPOINT = "periodes";
export const PERIODES_EXISTING_ENDPOINT = "periodes/{id}";
export const PERIODES_VALIDATION_ENDPOINT = "periodes/validation";
export const PERIODES_EXISTING_VALIDATION_ENDPOINT = "periodes/{id}/validation";
export const PARAM_REINSCRIPTION_PRIORITAIRE_ENDPOINT = "params/reinscription-enabled";
export const PARAM_ENDPOINT = "params";


export const ERROR_INVALID_CREDENTIALS = "ERROR_INVALID_CREDENTIALS";
export const ERROR_INVALID_OLD_PASSWORD = "ERROR_INVALID_OLD_PASSWORD";

export type ApiCallbacks = {
    [key: string]: (result: any) => void;
}

export const isMatchingEndpoint = (method: string, endpointPattern: string, url: string, httpMethod: string) => {
    // Remplacer les {paramName} par \w+ pour matcher les paramètres dynamiques
    const regex = new RegExp(`^${endpointPattern.replace(/{\w+}/g, "\\w+")}$`);
    // Vérifier si l'URL et la méthode correspondent
    return regex.test(url) && method.toUpperCase() === httpMethod.toUpperCase();
};

export const buildUrlWithParams = (urlTemplate: string, params: Record<string, any>) => {
    return urlTemplate.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
};

export const handleApiCall = (method: HttpMethod, url: string, apiCallbacks: ApiCallbacks) => {
    for (const key in apiCallbacks) {
        const [callbackMethod, endpointPattern] = key.split(":");
        if (isMatchingEndpoint(callbackMethod, endpointPattern, url, method)) {
            return apiCallbacks[key];
        }
    }
    return null;
};