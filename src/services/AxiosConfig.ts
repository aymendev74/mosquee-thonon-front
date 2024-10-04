import axios from "axios";

const AxiosInstance = axios.create({ baseURL: process.env.REACT_APP_BASE_URL_API });

AxiosInstance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

export { AxiosInstance };
