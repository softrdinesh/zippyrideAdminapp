// in /services/api.ts

import { useQuery } from "@tanstack/react-query";
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

export const useGetAllComplaints = () => {
  return useQuery<ComplaintListItem[], Error>({
    queryKey: ["allComplaints"],
    queryFn: () => api.get("api/Admin/GetAllComplaints"),
  });
};
