// in /services/api.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

export interface ComplaintListItem {
  id: number;
  compliantCategoryID: number;
  compliantCategoryname: string;
  compliantMessage: string;
  compliantBy: number;
  compliantpersonname: string;
  compliantPersonadderss: string;
  compliantPersonMobileno: string;
  compliantPersonWhatsappno: string;
  caseOpenedDate: string;
  caseClosedDate: string;
  attachment: string | null;
  attachfilename: string | null;
  caseno: string;
  caseStatus: "Open" | "Closed" | string;
}

export interface UpdateComplaintPayload {
  id: number;
  caseno: string;
  comments: string;
}

export const useGetAllComplaints = () => {
  return useQuery<ComplaintListItem[], Error>({
    queryKey: ["allComplaints"],
    queryFn: () => api.get("api/Admin/GetAllComplaints"),
  });
};

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateComplaintPayload>({
    mutationFn: (data) => api.post("api/Admin/UpdateCase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
    },
  });
};
