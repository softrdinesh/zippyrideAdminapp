import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

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

interface VehicleSetupPayload {
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

export const useGetVehiclesByOwnerId = (ownerId: number | undefined) => {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles", ownerId],
    queryFn: () =>
      api.get(`api/Vehicles/GetVehicleListByOwnerID?OwnerID=${ownerId}`),
    enabled: !!ownerId,
  });
};

export const useGetVehicleById = (vehicleId) => {
  return useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () =>
      api.get(`api/Vehicles/GetSpecificVehicleDetails/${vehicleId}`),
    enabled: !!vehicleId, // The query will not run until vehicleId is available
  });
};
