import { notification } from 'antd';
import { useAxios } from './useAxios';
import { useAuth } from './AuthContext';
import { useState } from 'react';

export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";

export type ApiCallDefinition = {
    url: string,
    method: HttpMethod,
    data?: any,
    params?: any
}

export type APICallResult<T> = {
    successData?: T | null;
    errorData?: any;
    success: boolean;
}

const useApi = () => {
    const axios = useAxios();
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const execute = async <T,>(apiCallDefinition: ApiCallDefinition): Promise<APICallResult<T>> => {
        setIsLoading(true);
        return axios.request({
            ...apiCallDefinition,
            withCredentials: true,
            paramsSerializer: {
                indexes: null
            }
        }).then(response => {
            return { success: true, successData: response.data as T };
        }).catch(function (error) {
            console.log("error", error);
            if (error.response && error.response.status === 401) {
                login();
                return { success: false, successData: null, errorData: null }; // 🔹 retour explicite
            } else {
                if (error.response && error.response.data) { // gestion spécifique de l'erreur via le composant appelant
                    return { success: false, errorData: error.response.data }
                } else {
                    notification.open({ message: "Une erreur est survenue", type: "error" });
                    return { success: false, successData: null, errorData: null };
                }
            }
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return { execute, isLoading };
};

export default useApi;