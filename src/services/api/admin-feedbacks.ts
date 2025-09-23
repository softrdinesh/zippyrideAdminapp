import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient";

export interface FeedbackListItem {
  feedbackID: number;
  feedbackContent: string;
  feedbackgivenUserID: number;
  feedbackGivenBy: string;
  feedbackSubmittedDate: string; // Format: "DD-MM-YYYY"
}

export const useGetAllFeedbacks = () => {
  return useQuery<FeedbackListItem[], Error>({
    queryKey: ["allFeedbacks"],
    queryFn: () => api.get("api/Admin/GetAllFeedbacks"),
  });
};
