import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { useAxios } from './useAxios';

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

    const executeApiCall = async (apiCallDefinition: ApiCallDefinition): Promise<APiCallResult> => {
        return axios.request({
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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(false);
            try {
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