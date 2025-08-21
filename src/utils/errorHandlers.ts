import { AxiosError } from "axios";
import { getAxiosErrorMessage } from "../uikit/UikitUtils/helpers";
import Toast from "react-native-toast-message";

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

export const handleApiError = (error: AxiosError): ApiError => {
  // Get user-friendly message using existing utility
  const message = getAxiosErrorMessage(error);

  if (error.response) {
    return {
      message,
      status: error.response.status,
      code: getErrorCode(error.response.status),
    };
  } else if (error.request) {
    return {
      message,
      code: "NETWORK_ERROR",
    };
  }

  return {
    message,
    code: "UNKNOWN_ERROR",
  };
};

const getErrorCode = (status: number): string => {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 500:
      return "SERVER_ERROR";
    default:
      return "UNKNOWN";
  }
};
