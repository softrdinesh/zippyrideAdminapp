import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../apiClient";

export interface DriverDetails {
  driverID: number;
  riderLoginAccountname: string;
  riderAddress: string;
  mobileNo: string;
  companyname: string;
  gpayno: string;
  paytmno: string;
  drivername: string;
  licenseNo: string;
  licenseExpirydate: string;
  isFemale: 0 | 1;
  rating: number | null;
  driverStatus: "Active" | "Inactive";
  ownerID: number;
  owneraccountName: string;
  whatsappno: string | null;
  riderpic: string | null;
  vehId: number;
  vehiclename: string;
  vehicleno: string;
  telegramID: string;
}

export const useGetDriversByOwnerID = (ownerId?: number) => {
  return useQuery<DriverDetails[], Error>({
    queryKey: ["driverDetails", ownerId],
    queryFn: () =>
      api.get(`api/Driver/GetDriverInfobyOwnerID?OwnerID=${ownerId}`),
    enabled: !!ownerId,
  });
};

export const useCreateDriver = () => {
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.postFormData("api/Driver/DriverSignup", formData),
  });
};
