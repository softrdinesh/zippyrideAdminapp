import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("owner/profile"),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: FormData) => api.putFormData("owner/profile", data),
  });
};
