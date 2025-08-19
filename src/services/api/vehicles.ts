import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get("owner/vehicles"),
  });
};

export const useAddVehicle = () => {
  return useMutation({
    mutationFn: (data: FormData) => api.postFormData("owner/vehicles", data),
  });
};
