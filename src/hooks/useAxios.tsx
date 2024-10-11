import React, { useEffect } from "react";
import axios from "axios";
import { useAuth } from './AuthContext';

const AxiosInstance = axios.create({ baseURL: process.env.REACT_APP_BASE_URL_API_V1 });

export const useAxios = () => {
    const { getAccessTokenSilently } = useAuth();

    function setupInterceptors() {
        AxiosInstance.interceptors.request.clear();
        AxiosInstance.interceptors.request.use((config) => {
            const token = getAccessTokenSilently();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    };

    useEffect(() => {
        setupInterceptors();
    }, []);

    return AxiosInstance;
};