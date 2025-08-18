import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import Toast from "react-native-toast-message";
import { getItem, removeItem, setItem } from "./mmkvStorage";

// Base query setup

export const BASE_URL = "https://uat.zippyrideadminapi.projectpulse360.com/";
const baseQuery = fetchBaseQuery({
  // baseUrl: 'https://dfd7-150-129-164-86.ngrok-free.app/api/',
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const userData = getItem("userData");

    const userDetail = JSON.parse(userData);
    const token = userDetail?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  timeout: 100000,
});

export const baseQueryWithInterceptor = async (
  args?: any,
  api?: any,
  extraOptions?: any
) => {
  try {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const error = result.error as FetchBaseQueryError;
      switch (error.status) {
        // switch (error.originalStatus) {
        case 401: // Unauthorized
          Toast.show({
            type: "customToast",
            text1: "error",
            text2: "Your token is expired",
          });
          // api.dispatch(logout());
          setItem("isLoggedIn", "false"); // Update Redux store and MMKV
          removeItem("userData"); // Optionally remove user data from MMKV
          break;

        case 403: // Forbidden
          Toast.show({
            type: "customToast",
            text1: "error",
            text2: String(
              error.data ?? "You are not authorized to access this resource."
            ),
          });

          break;

        case 404: // Not Found
          Toast.show({
            type: "customToast",
            text1: "error",
            text2: String(error.data ?? "Resource not found."),
          });

          break;

        case 500: // Server Error
        case "FETCH_ERROR": // Network or fetch errors
          Toast.show({
            type: "customToast",
            text1: "error",
            text2: String(
              error.data ?? "A server error occurred. Please try again later."
            ),
          });
          break;

        default:
          Toast.show({
            type: "customToast",
            text1: "error",
            text2: String(error.data),
          });

          break;
      }
    }
    return result;
  } catch (error) {
    console.error("Unexpected Error:", error);
    Toast.show({
      type: "customToast",
      text1: "error",
      text2: String(error.data ?? "A Unexpected error occurred"),
    });
    return { error: { status: "FETCH_ERROR" } }; // Return a fallback error result
  }
};

// Define API endpoints
export const api = createApi({
  baseQuery: baseQueryWithInterceptor,
  tagTypes: [],
  endpoints: (build) => ({
    userSignup: build.mutation({
      query: (payload) => ({
        url: "OwnerSignup",
        method: "POST",
        body: payload,
      }),
    }),

    // * Authentication
    userLogin: build.mutation({
      query: (payload) => ({
        url: "users/login",
        method: "POST",
        body: payload,
      }),
    }),

    // * ForgetPassword
    forgotPasswordOTP: build.mutation({
      query: (payload) => ({
        url: "users/send-otp",
        method: "POST",
        body: payload,
      }),
    }),
    Forgotpassword: build.mutation({
      query: (payload) => ({
        url: "users/forgot-password",
        method: "POST",
        body: payload,
      }),
    }),
    verifyotp: build.mutation({
      query: (payload) => ({
        url: "users/validate-otp",
        method: "POST",
        body: payload,
      }),
    }),

    Getuserinformation: build.mutation({
      query: ({ userID }) =>
        `Authentication/GetAccountInfo?AccountID=${userID}`,
    }),

    // trip booking
    Tripbook: build.mutation({
      query: (payload) => ({
        url: "trips/book-without-rider",
        method: "POST",
        body: payload,
      }),
    }),

    Tripbookspecific: build.mutation({
      query: (payload) => ({
        url: "trips/book-specific-rider",
        method: "POST",
        body: payload,
      }),
    }),

    // rider login

    riderlogin: build.mutation({
      query: (payload) => ({
        url: "riders/login",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

//payment

// Export hooks for the above endpoints
export const {
  useUserSignupMutation,
  useUserLoginMutation,
  useForgotPasswordOTPMutation,
  useGetuserinformationMutation,
  useVerifyotpMutation,
  useForgotpasswordMutation,
  useTripbookMutation,
  useTripbookspecificMutation,
  useRiderloginMutation,
} = api;
