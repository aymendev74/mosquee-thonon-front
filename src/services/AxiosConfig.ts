import axios from "axios";

const AxiosInstance = axios.create();

AxiosInstance.interceptors.request.use((config) => {
    config.baseURL = process.env.REACT_APP_BASE_URL_API;
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

export { AxiosInstance };
