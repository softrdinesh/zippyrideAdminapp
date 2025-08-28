import { useQuery } from "@tanstack/react-query";
import { api } from "../apiClient"; // Your API client

interface Trip {
  ownerID: number;
  riderID: number;
  ridername: string;
  tripNo: string;
  pickupLocation: string;
  dropLocation: string;
  tripdate: string;
  amount: number;
  paymentmethod: string;
  vehno: string;
  vehname: string;
  tripstartdate: string;
  tripCanceldate: string;
}

// 1. Define the type for a single trip object from your list API
export interface TripListItem {
  ownerID: number;
  riderID: number;
  ridername: string;
  tripNo: string;
  pickupLocation: string;
  dropLocation: string;
  tripdate: string;
  amount: number;
  paymentmethod: string;
  vehno: string;
  vehname: string;
  tripstartdate: string;
  tripCanceldate: string;
  // Add a status field that we can derive
  status?: "Completed" | "Cancelled" | "In Progress";
}

export const useGetTripsByOwner = (
  ownerId?: number,
  statusId?: number | null,
  searchParam?: string
) => {
  return useQuery<TripListItem[], Error>({
    queryKey: ["trips", ownerId, statusId, searchParam],
    queryFn: async () => {
      let url = `api/Vehicles/getTripDetailsByOwner?OwnerID=${ownerId}`;
      if (statusId) {
        url += `&StatusID=${statusId}`;
      }
      if (searchParam) {
        url += `&Searchparam=${searchParam}`;
      }
      const trips = await api.get<TripListItem[]>(url);
      // You can derive the status here if the API doesn't provide it
      return trips.map((trip) => ({
        ...trip,
        status: trip.tripCanceldate ? "Cancelled" : "Completed", // Example logic
      }));
    },
    enabled: !!ownerId,
  });
};
