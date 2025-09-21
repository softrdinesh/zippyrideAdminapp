import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";
import { UserProfile } from "../../zustand/useAuthStore";

export interface OwnerListItem {
  ownerID: number;
  ownerUsername: string;
  companyname: string;
  locationID: number;
  countryID: number;
  status: "Active" | "In-active";
  profilepic: string | null;
  address: string;
  mobileno: string;
  whatsappno: string | null;
  ownername: string;
  noofVehiclesAttached: number;
  telegramid: string | null;
  isPaymentPending: boolean;
  amount: number;
  lastpaymentDate: string;
  nextpaymentTime: string;
}

export interface Owner {
  ownerID: number;
  ownerUsername: string;
  companyname: string;
  mobileno: string;
  whatsappno: string;
  address: string;
  countryID: number;
  locationID: number;
  profilepic: string | null;
  status: "Active" | "In-active";
}

export interface ResetOwnerPasswordPayload {
  ownerID: number;
}

export interface ToggleOwnerStatusPayload {
  ownerID: number;
  isEnable: boolean;
}

export const useGetAllOwners = (userProfile?: UserProfile | null) => {
  return useQuery<OwnerListItem[], Error>({
    queryKey: ["allOwners", userProfile?.token],
    queryFn: () => {
      if (!userProfile) {
        throw new Error("User profile is not available for fetching owners.");
      }

      let url = "api/Admin/";

      if (userProfile.isSuperAdmin) {
        url += "GetAllOwnerList";
      } else {
        url += `GetAllOwnerListByLocation?LocationID=${userProfile.locationID}&CountryID=${userProfile.countryID}`;
      }

      return api.get(url);
    },
    enabled: !!userProfile?.token,
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
    mutationFn: (data) => api.post("api/Admin/OwnerPasswordReset", data),
  });
};

export const useToggleOwnerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, ToggleOwnerStatusPayload>({
    mutationFn: (data) => api.post("api/Admin/EnableDisableOwners", data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOwners"] });
    },
  });
};
