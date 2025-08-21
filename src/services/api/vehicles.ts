import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

interface VehicleColor {
  colourId: number;
  colname: string;
  isActive: boolean;
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

export const useGetVehicleColors = () => {
  return useQuery<VehicleColor[]>({
    queryKey: ["vehicleColors"],
    queryFn: () => api.get("api/Vehicles/GetVehicleColors"),
  });
};

export const useSetupVehicle = () => {
  return useMutation({
    mutationFn: (data: FormData) =>
      api.postFormData("api/Vehicles/SetupVehicle", data),
  });
};
