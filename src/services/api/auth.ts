import { useMutation, useQuery } from "@tanstack/react-query";
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

export interface CountryListItem {
  countryID: number;
  countryName: string;
}

export interface LocationListItem {
  locationID: number;
  locationName: string;
  countryID: number;
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

export const useGetCountries = () => {
  return useQuery<CountryListItem[], Error>({
    queryKey: ["countries"],
    queryFn: () => api.get("GetCountryList"),
  });
};
export const useGetLocations = () => {
  return useQuery<LocationListItem[], Error>({
    queryKey: ["locations"],
    queryFn: () => api.get("GetLocationList"),
  });
};
