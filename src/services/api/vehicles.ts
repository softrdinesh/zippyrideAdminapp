import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";
import { useAuthStore } from "../../zustand/useAuthStore";

interface VehicleColor {
  colourId: number;
  colname: string;
  isActive: boolean;
}
interface VehicleType {
  typeId: number;
  vehTypeName: string;
  createDate: string | null;
  updateDate: string | null;
  updateby: string | null;
  isEv: string | null;
  isHybrid: string | null;
  noOfPassengersAllowed: number;
  vehicleInfo: Array<any>;
}

export interface VehicleListItem {
  vehicleID: number;
  vehiclename: string;
  vehicleno: string;
  status: "Active" | "In-active";
  vehiclepic: string | null;
  isActive: boolean;
  chassisno?: string;
  vehicleTypeInfo: string;
  engineno?: string;
}

interface Vehicle {
  Chasisno: string;
  Others: string;
  EngineNo: string;
  VehName: string;
  VehcolorId: number;
  IsHybrid: boolean;
  CreateDate: string;
  VehPicFile: any;
  IsPetrolVech: boolean;
  VehTypeId: number;
  OwnerId: number;
  IsCngenabled: boolean;
  VehPic: string;
  UpdateDate: string;
  Vehno: string;
  IsEv: boolean;
  IsDesielvech: boolean;
  FcexpiryDate: string;
}

export interface ToggleVehicleStatusPayload {
  ownerID: number;
  vehicleID: number;
  isEnable: boolean;
}

export const useGetVehicleColors = () => {
  return useQuery<VehicleColor[]>({
    queryKey: ["vehicleColors"],
    queryFn: () => api.get("api/Vehicles/GetVehicleColors"),
  });
};
export const useGetVehicleTypes = () => {
  return useQuery<VehicleType[]>({
    queryKey: ["vehicleTypes"],
    queryFn: () => api.get("api/Vehicles/GetVehicleTypes"),
  });
};

export const useSetupVehicle = () => {
  return useMutation({
    mutationFn: (data: FormData) =>
      api.postFormData("api/Vehicles/SetupVehicle", data),
  });
};

export const useEditVehicle = () => {
  return useMutation({
    mutationFn: (data: FormData) =>
      api.postFormData("api/Vehicles/UpdateVehicle", data),
  });
};

export const useGetVehiclesByOwnerId = (ownerId?: number) => {
  const { userRole } = useAuthStore.getState();

  return useQuery<VehicleListItem[], Error>({
    queryKey: ["vehicles", ownerId, userRole],
    queryFn: async () => {
      if (!ownerId) return [];

      let url: string;
      if (userRole === "admin") {
        url = `api/Admin/GetVehicleListbyOwner?OwnerID=${ownerId}`;
      } else {
        url = `api/Vehicles/GetVehicleListByOwnerID?OwnerID=${ownerId}`;
      }

      const response = await api.get<any[]>(url);

      return response.map((item) => ({
        vehID: item.vehicleID || item.vehID,
        vehName: item.vehiclename || item.vehName,
        vehno: item.vehicleno || item.vehno,
        vehiclePicture:
          item.vehiclepic || item.vehiclePicture || item.VehPicFile,
        status: item.status || (item.isActive ? "Active" : "In-active"),
        vehicleTypeInfo: item.vehicleTypeInfo,
      }));
    },
    enabled: !!ownerId,
  });
};

export const useGetVehicleById = (vehicleId) => {
  return useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () =>
      api.get(`api/Vehicles/GetSpecificVehicleDetails/${vehicleId}`),
    enabled: !!vehicleId,
  });
};

export const useToggleVehicleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ToggleVehicleStatusPayload>({
    mutationFn: (data) => api.post("api/Admin/EnableDisableVehicles", data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle", variables.vehicleID],
      });
    },
  });
};

export const useAdminSetupVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, FormData>({
    mutationFn: (formData) =>
      api.postFormData("api/Admin/SetupVehiclebyAdmin", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useAdminEditVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, FormData>({
    mutationFn: (formData) =>
      api.postFormData("api/Admin/UpdateVehicleInfo", formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle", variables.vehicleID],
      });
    },
  });
};
