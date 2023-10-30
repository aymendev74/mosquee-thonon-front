import axios from "axios";

const AxiosInstance = axios.create();

AxiosInstance.interceptors.request.use((config) => {
    config.baseURL = "http://localhost:8080/v1/";
    // config.baseURL = "https://mosquee-thonon.ew.r.appspot.com/v1/";
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

export { AxiosInstance };