import { useState, useEffect } from 'react';
import { executeApiCall } from './services';

export type ApiCallDefinition = {
    url?: string,
    method?: string,
    data?: any,
    params?: string
}

const useApi = (apiCallDef?: ApiCallDefinition) => {
    const [result, setResult] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [apiCallDefinition, setApiCallDefinition] = useState<ApiCallDefinition | undefined>(apiCallDef);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(false);
            try {
                const responseData = await executeApiCall(apiCallDefinition!);
                setResult(responseData);
            } catch (err) {
                setError(true);
            } finally {
                setIsLoading(false);
            }

        }
        if (apiCallDefinition) {
            fetchData();
        }
    }, [apiCallDefinition]);

    return { setApiCallDefinition, result, isLoading, error };
};

export default useApi;