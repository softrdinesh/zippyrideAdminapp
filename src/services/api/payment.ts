import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../apiClient";

export interface PaymentInfo {
  code: number;
  isPaymentPending: boolean;
  amount?: number;
  message?: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: any[];
  created_at: number;
}

export interface UpdatePaymentPayload {
  ownerID: number;
  razorpaymentID: string;
  vehicleID:number
}

export interface UpdateFailedPaymentPayload {
  ownerID: number;
  razorpaymentID: string;
  amount: number;
  isCancelpayment: boolean;
  ispaymentFail: boolean;
}

export const useGetPaymentInfo = (ownerId?: number) => {
  return useQuery<PaymentInfo, Error>({
    queryKey: ["paymentInfo", ownerId],
    queryFn: () => api.get(`api/Payment/GetPaymentinfo?OwnerID=${ownerId}`),
    enabled: !!ownerId,
  });
};

export const useGenerateRazorpayOrder = () => {
  return useMutation<RazorpayOrder, Error, FormData>({
    mutationFn: (data) =>
      api.postFormData("api/Payment/GenerateRazorPayOrderID", data),
  });
};

export const useUpdateOnlinePayment = () => {
  return useMutation<any, Error, UpdatePaymentPayload>({
    mutationFn: (data) => api.post("api/Payment/UpdateOnlinePayment", data),
  });
};

export const useUpdateFailedPayment = () => {
  return useMutation<any, Error, UpdateFailedPaymentPayload>({
    mutationFn: (data) => api.post("api/Payment/UpdateFailedPayment", data),
  });
};
