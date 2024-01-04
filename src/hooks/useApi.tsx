import { useState, useEffect } from 'react';
import { executeApiCall } from '../services/services';

export type ApiCallDefinition = {
    url?: string,
    method?: string,
    data?: any,
    params?: any
}

const useApi = (apiCallDef?: ApiCallDefinition) => {
    const [result, setResult] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorResult, setErrorResult] = useState<string>();
    const [apiCallDefinition, setApiCallDefinition] = useState<ApiCallDefinition | undefined>(apiCallDef);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(false);
            try {
                const responseData = await executeApiCall(apiCallDefinition!);
                setResult(responseData);
            } catch (err) {
                console.log(err);
                setError(true);
                const error = err as any;
                if (error.response && error.response.data) {
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
    }

    return { setApiCallDefinition, result, isLoading, error, errorResult, apiCallDefinition, resetApi };
};

export default useApi;