import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { useAxios } from './useAxios';
import { useAuth } from './AuthContext';

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export type ApiCallDefinition = {
    url: string,
    method: HttpMethod,
    data?: any,
    params?: any
}

export type APiCallResult = {
    responseData?: any;
    status?: number;
}

const useApi = (apiCallDef?: ApiCallDefinition) => {
    const [result, setResult] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorResult, setErrorResult] = useState<string>();
    const [apiCallDefinition, setApiCallDefinition] = useState<ApiCallDefinition | undefined>(apiCallDef);
    const [status, setStatus] = useState<number | undefined>();
    const axios = useAxios();
    const { getLoggedUser, getAccessToken } = useAuth();

    const executeApiCall = async (apiCallDefinition: ApiCallDefinition): Promise<APiCallResult> => {
        console.log("exec appel API", JSON.stringify(apiCallDefinition));
        return axios.request({
            ...apiCallDefinition,
            paramsSerializer: {
                indexes: null
            }
        }).then(response => {
            console.log("response", response);
            return { responseData: response.data, status: response.status };
        }).catch(function (error) {
            console.log("error", error);
            // Si pas de code d'erreur spécifique renvoyé par le back, alors on affiche un message d'erreur standard (problème technique)
            // Sinon on ne fait rien d'autre que levé l'erreur pour que ce soit géré par l'appelant (message spécifique à afficher à l'utilisateur)
            notification.open({ message: "Une erreur est survenue", type: "error" });
            throw error;
        });
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(false);
            try {
                // Si un utilisateur est connecté, on vérifie si son token est toujours bon
                if (getLoggedUser()) {
                    const token = getAccessToken();
                    if (!token) { // inutile d'aller plus loin (nouvelle authentification déclenchée)
                        return;
                    }
                }
                const apiCallResult = await executeApiCall(apiCallDefinition!);
                setResult(apiCallResult.responseData);
                setStatus(apiCallResult.status);
            } catch (err) {
                setError(true);
                const error = err as any;
                if (error.response && error.response.data) {
                    // gestion spécifique de l'erreur via le composant appelant
                    setErrorResult(error.response.data);
                }
            } finally {
                setIsLoading(false);
            }

        }
        if (apiCallDefinition) {
            fetchData();
        }
    }, [apiCallDefinition]);


    const resetApi = () => {
        setResult(undefined);
        setErrorResult(undefined);
        setApiCallDefinition(undefined);
        setStatus(undefined);
    }

    return { setApiCallDefinition, result, isLoading, errorResult, apiCallDefinition, status, resetApi };
};

export default useApi;