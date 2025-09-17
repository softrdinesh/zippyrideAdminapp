// in /services/api.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

// --- (Keep all your other hooks and types) ---

// 1. Interfaces for Owner Management
export interface Owner {
  ownerID: number;
  username: string;
  companyname: string;
  mobileno: string;
  address: string;
  countryID: number;
  locationID: number;
  profilepic: string | null;
  // Add any other fields you need for the details screen
}

export interface ResetOwnerPasswordPayload {
  ownerID: number;
}

// 2. New Hooks for Owner Management
export const useGetAllOwners = () => {
  return useQuery<Owner[], Error>({
    queryKey: ["allOwners"],
    queryFn: () => api.get("api/Admin/GetAllOwners"), // IMPORTANT: Replace with your actual endpoint
  });
};

export const useGetOwnerById = (ownerId?: number) => {
  return useQuery<Owner, Error>({
    queryKey: ["owner", ownerId],
    queryFn: () => api.get(`api/Admin/GetOwnerById?ownerId=${ownerId}`), // IMPORTANT: Replace endpoint
    enabled: !!ownerId,
  });
};

export const useEditOwner = () => {
  return useMutation({
    // Using any for response as it might vary
    mutationFn: (formData: FormData) =>
      api.putFormData("api/Admin/UpdateOwnerInfo", formData), // IMPORTANT: Replace endpoint
  });
};

export const useResetOwnerPassword = () => {
  return useMutation<any, Error, ResetOwnerPasswordPayload>({
    mutationFn: (data) => api.post("api/Admin/OwnerPasswordReset", data), // IMPORTANT: Replace endpoint
  });
};
