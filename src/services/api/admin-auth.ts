import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

interface AdminLoginPayload {
  accountID: string;
  password: string;
}

export interface AdminLoginResponse {
  code: number;
  message: string;
  token: string;
  issuperadmin: boolean;
  locationID: number;
  countryID: number;
}

export const useAdminLogin = () => {
  return useMutation<AdminLoginResponse, Error, AdminLoginPayload>({
    mutationFn: (data) => api.post("api/Admin/AdminLogin", data),
  });
};
