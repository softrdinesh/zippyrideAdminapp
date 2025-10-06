import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../zustand/useAuthStore";
import { handleApiError, ApiError } from "../utils/errorHandlers";
import { config } from "./config";

const apiClient = axios.create({
  baseURL: config.BASE_URL,
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
    // console.log(
    //   `🚀 [API Request] ${config.method?.toUpperCase()} | ${config.url}`,
    //   {
    //     headers: config.headers,
    //     data: config.data,
    //   }
    // );
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // --- DEBUG LOGGING ---
    // console.log(
    //   `✅ [API Response] ${response.config.method?.toUpperCase()} | ${
    //     response.config.url
    //   }`,
    //   {
    //     status: response.status,
    //     data: response.data,
    //   }
    // );
    // ---------------------
    return response;
  },
  (error: AxiosError) => {
    // console.log(
    //   `❌ [API Error] ${error.config?.method?.toUpperCase()} | ${
    //     error.config?.url
    //   }`,
    //   {
    //     message: error.message,
    //     response: error.response?.data,
    //   }
    // );
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
