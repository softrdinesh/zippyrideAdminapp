import { useMutation } from "@tanstack/react-query";
import { api } from "../apiClient";

interface LoginPayload {
  username: string;
  password: string;
  deviceToken: string;
  longitude: string;
  latitude: string;
}

interface LoginResponse {
  userId: string;
  userName: string;
  token: string;
  isFirstLogin: boolean;
}

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (data) => api.post("Ownerlogin", data),
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.postFormData("OwnerSignup", formData),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.post("users/forgot-password", data),
  });
};
