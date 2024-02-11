import axios from "axios";

const AxiosInstance = axios.create();

AxiosInstance.interceptors.request.use((config) => {
    config.baseURL = "http://31.207.35.195/api/v1/";
    //config.baseURL = "http://localhost:8080/api/v1/";
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

export { AxiosInstance };