import moment from "moment";
import { Alert, Linking, Platform } from "react-native";
import VersionCheck from "react-native-version-check";
import { isEmpty } from "./validators";
import axios from "axios";

export const isValidDate = (date) => {
  const timestamp = Date.parse(date);
  return Number.isNaN(timestamp) === false;
};

export const getDateString = (value, format, isUnix, convertToLocal) => {
  if (
    (typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "object") &&
    !Array.isArray(value) &&
    !isEmpty(format)
  ) {
    if (isUnix) {
      return moment.unix(Number(value)).format(format);
    } else {
      if (convertToLocal) return moment.parseZone(value).local().format(format);
      return moment.parseZone(value).format(format);
    }
  }
  return "";
};

export const isFinancial = (x) => {
  return Number.parseFloat(x).toFixed(2);
};

export const checkVersion = async () => {
  const latestVersion = await VersionCheck.getLatestVersion();
  // console.log('VersionCheck latestVersion =>', latestVersion);
  VersionCheck.needUpdate({
    currentVersion: VersionCheck.getCurrentVersion(),
    currentBuildNumber: VersionCheck.getCurrentBuildNumber(),
    latestVersion: latestVersion,
  }).then(async (res) => {
    if (res.isNeeded) {
      Alert.alert(
        "Update",
        "New version available in play store with new features. Please update  the app from Play Store.",
        [
          {
            text: "Update",
            onPress: () => {
              Linking.openURL(
                "https://play.google.com/store/apps/details?id=com.thooku_satti"
              );
            },
          },
        ]
      );
    }
  });
};

export function getAxiosErrorMessage(error) {
  if (!axios.isAxiosError(error)) {
    // Not an Axios error, handle generically
    return "An unexpected error occurred. Please try again.";
  }

  if (error.response) {
    console.log("Axios error response:", error.response);

    // Always show API message if present, even technical errors
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    // Server responded with a status code outside 2xx
    if (error.response.status === 500) {
      return "Something went wrong on our end. Please try again later.";
    }
    if (error.response.status === 404) {
      return "Requested resource not found.";
    }
    if (error.response.status === 401) {
      return "Unauthorized. Please check your credentials.";
    }
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    return `Error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response received
    return "No response from server. Please check your internet connection.";
  } else if (error.message) {
    // Something happened in setting up the request
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
