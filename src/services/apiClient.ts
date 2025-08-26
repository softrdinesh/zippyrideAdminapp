import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../zustand/useAuthStore";
import { handleApiError, ApiError } from "../utils/errorHandlers";

export const BASE_URL = "https://uat.zippyrideadminapi.projectpulse360.com/";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = handleApiError(error);

    // Show toast for errors
    Toast.show({
      type: "error",
      text1: apiError.code,
      text2: apiError.message,
      position: "top",
      topOffset: 60,
      visibilityTime: 4000,
    });

    // Handle authentication errors
    if (apiError.status === 401) {
      useAuthStore.getState().logoutOwner();
    }

    return Promise.reject(apiError);
  }
);

// Type-safe API methods
export const api = {
  async get<T>(url: string) {
    try {
      const response = await apiClient.get<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post<T>(url: string, data?: any) {
    try {
      const response = await apiClient.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put<T>(url: string, data?: any) {
    try {
      const response = await apiClient.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete<T>(url: string) {
    try {
      const response = await apiClient.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async postFormData<T>(url: string, data: FormData): Promise<T> {
    try {
      const response = await apiClient.post<T>(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async putFormData<T>(url: string, data: FormData): Promise<T> {
    try {
      const response = await apiClient.put<T>(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
