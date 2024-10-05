import React, { useEffect } from "react";
import axios from "axios";
import { useAuth } from './AuthContext';

const AxiosInstance = axios.create({ baseURL: process.env.REACT_APP_BASE_URL_API });

export const useAxios = () => {
    const { getAccessToken } = useAuth();

    let axiosInterceptor: number = 0;

    function setupInterceptors() {
        AxiosInstance.interceptors.request.clear();
        axiosInterceptor = AxiosInstance.interceptors.request.use((config) => {
            const token = getAccessToken();
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