import axios from "axios";


export const AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/v1/",
    headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
    },
});