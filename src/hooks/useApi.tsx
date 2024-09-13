import { useState, useEffect } from 'react';
import { executeApiCall } from '../services/services';
import { notification } from 'antd';

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export type ApiCallDefinition = {
    url: string,
    method: HttpMethod,
    data?: any,
    params?: any
}

const useApi = (apiCallDef?: ApiCallDefinition) => {
    const [result, setResult] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorResult, setErrorResult] = useState<string>();
    const [apiCallDefinition, setApiCallDefinition] = useState<ApiCallDefinition | undefined>(apiCallDef);
    const [status, setStatus] = useState<number | undefined>();

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