import axios from "axios";
import { storage } from "./helperFunctions";

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    withCredentials: true,
});

axiosInstance.interceptors.request.use((req) => {
    const token = storage.get("accessToken");
    if (token) {
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

// Flag to track the refresh request state
let isRefreshing = false;
let failedQueue = []; // A queue to store failed requests that need to be retried after token refresh

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (!isRefreshing) {
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Send a request to refresh the access token
                    const { data } = await axiosInstance.post(
                        "/users/refresh-token",
                        {
                            withCredentials: true,
                        }
                    );

                    const { accessToken } = data.data;
                    if (accessToken) {
                        // Store the new access token
                        storage.set("accessToken", accessToken);
                        axiosInstance.defaults.headers.common[
                            "Authorization"
                        ] = `Bearer ${accessToken}`;

                        processQueue(null, accessToken);

                        // Retry the original request with the new access token
                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${accessToken}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (err) {
                    console.error("Token refresh failed:", err);
                    processQueue(err, null);
                    axiosInstance
                        .post("/users/logout", {
                            withCredentials: true,
                        })
                        .then(() => {
                            storage.remove("accessToken");
                            window.location.href = "/login";
                        });
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers[
                        "Authorization"
                    ] = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        // Reject if the error is not 401
        return Promise.reject(error);
    }
);

export default axiosInstance;
