import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  Platform,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import Geolocation from "@react-native-community/geolocation";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";
import messaging from "@react-native-firebase/messaging";

import SvgBack from "../../icons/SvgBack";
import SvgEye from "../../icons/SvgEye";
import SvgEyeOutline from "../../icons/SvgEyleOutLine";
import InputText from "../../uikit/InputText/InputText";
import Button from "../../uikit/Button/Button";
import { getItem, setItem } from "../../utils/mmkvStorage";
import Loader from "../../uikit/Loader/Loader";
import { useForgotPassword, useLogin } from "../../services/api";
import { useAuthStore } from "../../zustand/useAuthStore";
import { useAdminLogin } from "../../services/api/admin-auth";
import { getAxiosErrorMessage } from "../../uikit/UikitUtils/helpers";

const { width, height } = Dimensions.get("window");

const SignInScreen = () => {
  const navigation = useNavigation();
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [role, setRole] = useState("owner");

  const loginMutation = useLogin();
  const adminLoginMutation = useAdminLogin();

  const { loginUser } = useAuthStore();

  const forgotPasswordMutation = useForgotPassword();
  const locationRef = useRef({
    latitude: null,
    longitude: null,
    lastUpdate: 0,
  });
  const watchIdRef = useRef(null);

  // Optimized location acquisition with fallbacks
  useEffect(() => {
    const LOCATION_TIMEOUT = 10000; // 10 seconds
    const HIGH_ACCURACY =
      Platform.OS === "android"
        ? {
            enableHighAccuracy: true,
            timeout: LOCATION_TIMEOUT,
            maximumAge: 0, // No cached positions
            distanceFilter: 0, // Get updates regardless of distance
            accuracy: {
              android: "high",
            },
          }
        : {
            enableHighAccuracy: true,
            timeout: LOCATION_TIMEOUT,
            maximumAge: 0,
            distanceFilter: 0,
          };

    const LOW_ACCURACY = {
      enableHighAccuracy: false,
      timeout: LOCATION_TIMEOUT,
      maximumAge: 0,
      distanceFilter: 10,
    };

    let timeoutId;
    let isMounted = true;

    const handleLocationSuccess = (position) => {
      if (!isMounted) return;

      const { latitude, longitude } = position.coords;
      const now = Date.now();

      // Only update if we got a new position
      if (
        latitude !== locationRef.current.latitude ||
        longitude !== locationRef.current.longitude
      ) {
        locationRef.current = {
          latitude,
          longitude,
          lastUpdate: now,
        };

        setLocationReady(true);
      }
    };
    const handleLocationError = (error) => {
      if (!isMounted) return;

      console.log("Location error:", error);

      // Fallback to low accuracy if high accuracy fails
      if (
        error.code === error.TIMEOUT ||
        error.code === error.POSITION_UNAVAILABLE
      ) {
        console.log("Trying low accuracy location");
        Geolocation.getCurrentPosition(
          handleLocationSuccess,
          (fallbackError) => {
            console.log("Fallback location error:", fallbackError);
            setLocationReady(false);
          },
          LOW_ACCURACY
        );
      } else {
        setLocationReady(false);
      }
    };

    // First try with high accuracy
    Geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      HIGH_ACCURACY
    );

    // Start watching for continuous updates
    watchIdRef.current = Geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      HIGH_ACCURACY
    );

    // Set timeout to fallback to low accuracy if high accuracy takes too long
    timeoutId = setTimeout(() => {
      if (!locationRef.current.latitude) {
        console.log("High accuracy taking too long, trying low accuracy");
        Geolocation.getCurrentPosition(
          handleLocationSuccess,
          handleLocationError,
          LOW_ACCURACY
        );
      }
    }, 3000); // Wait 3 seconds before trying fallback

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Android location enabler - only prompt if we don't have location
  useEffect(() => {
    let intervalId;

    if (Platform.OS === "android" && !locationReady) {
      const enableLocation = async () => {
        try {
          await promptForEnableLocationIfNeeded();
        } catch (error) {
          console.warn("Location enable error:", error);
        }
      };

      // Run immediately and then every 30 seconds if still no location
      enableLocation();
      intervalId = setInterval(enableLocation, 30000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [locationReady]);

  const SignUpSchema = Yup.object().shape({
    username: Yup.string().required("Please Enter username"),
    password: Yup.string()

      .when("role", {
        is: "owner",
        then: (schema) =>
          schema.min(8, "Password must be at least 8 characters"),
      })
      .required("Password is required"),
    role: Yup.string().oneOf(["owner", "admin"]).required(),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      role: "owner",
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values) => {
      if (!locationReady) {
        Toast.show({
          type: "error",
          text1: "Location Error",
          text2: "Please enable location services and try again",
          position: "top",
          topOffset: 5,
        });
        return;
      }

      setLoading(true);
      try {
        let response;
        let success = false;
        const fcmToken = await messaging().getToken();
        if (values.role === "owner") {
          // --- Owner Login Flow ---
          const payload = {
            username: values.username,
            password: values.password,
            deviceToken: fcmToken,
            longtitude: locationRef.current.longitude?.toString(),
            latitude: locationRef.current.latitude?.toString(),
          };
          response = await loginMutation.mutateAsync(payload);

          if (response?.loginStatus) {
            loginUser(
              {
                id: response.ownerID.toString(),
                username: response.username,
                profilepic: response.profilepic,
                mobileno: response.mobileno,
                token: response.tokenvalue,
                isVehicleTag: response.isvehicleTag,
              },
              "owner"
            );
            success = true;
          }
        } else {
          // --- Admin Login Flow ---
          const payload = {
            accountID: values.username,
            password: values.password,
            Devicetoken: fcmToken,
          };
          response = await adminLoginMutation.mutateAsync(payload);

          if (response?.code === 5999 && response?.token) {
            loginUser(
              {
                id: 0,
                username: values.username,
                token: response.token,
                isSuperAdmin: response.issuperadmin,
                locationID: response.locationID,
                countryID: response.countryID,
                isVehicleTag: true,
              },
              "admin"
            );
            success = true;
          }
        }
        console.log("Login response:", response);

        // --- Common Success/Error Handling ---
        if (success) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Login successful",
          });
          formik.resetForm();
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: response?.message || "Invalid credentials",
          });
        }
      } catch (error) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: getAxiosErrorMessage(error),
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const Resendvalue = async (username) => {
    setLoading(true);
    try {
      const payload = { Email: username, OtpType: "SI" };
      const response = await forgotPasswordMutation.mutateAsync(payload);

      setLoading(false);

      if (response.error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid Username",
          position: "top",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `${username} OTP sent successfully`,
          position: "top",
        });
      }
    } catch (err) {
      setLoading(false);
      if (err.name === "ValidationError") {
        setError(err.message);
      } else {
        console.error("Submit Error:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong",
          position: "top",
        });
      }
    }
  };

  // ... rest of your component code remains the same ...
  const toastConfig = {
    success: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <Text style={styles.toastSuccessText}>{text1}</Text>
        <Text style={styles.toastText}>{text2}</Text>
      </View>
    ),
    error: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <Text style={styles.toastErrorText}>{text1}</Text>
        <Text style={styles.toastText}>{text2}</Text>
      </View>
    ),
    customToast: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <Text style={styles.toastSuccessText}>{text1}</Text>
        <Text style={styles.toastText}>{text2}</Text>
      </View>
    ),
  };

  const Showsuccess = () => {
    Toast.show({
      type: "customToast",
      text1: "Success",
      text2: "Login Successfully ✅",
      position: "top",
      topOffset: 5,
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/frame.jpeg")}
      style={styles.container}
    >
      {loading && <Loader />}
      <Toast
        config={toastConfig}
        ref={(ref) => Toast.setRef(ref)}
        position="top"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Common")}
          style={styles.backButton}
        >
          <SvgBack height={19} width={19} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Image
            source={require("../../assets/image1.png")}
            style={styles.image}
          />

          <View style={styles.locationStatusContainer}>
            <View style={styles.locationStatusCard}>
              {locationReady ? (
                <></>
              ) : (
                <View style={styles.locationAcquiring}>
                  <Loader />
                  <Text style={styles.locationStatusText}>
                    Fetching Location...
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.roleSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formik.values.role === "owner" && styles.roleButtonActive,
              ]}
              onPress={() => formik.setFieldValue("role", "owner")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formik.values.role === "owner" && styles.roleButtonTextActive,
                ]}
              >
                Owner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formik.values.role === "admin" && styles.roleButtonActive,
              ]}
              onPress={() => formik.setFieldValue("role", "admin")}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formik.values.role === "admin" && styles.roleButtonTextActive,
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* 8. Dynamic Label */}
          <Text style={styles.label}>
            {formik.values.role === "owner"
              ? "Enter Username"
              : "Enter Account ID"}
          </Text>
          <InputText
            name="username"
            touched={formik.touched}
            errors={formik.errors}
            error={formik.errors.username && formik.touched.username}
            maxLength={50}
            keyboardType="text"
            placeholder={
              formik.values.role === "owner"
                ? "Enter username"
                : "Enter account ID"
            }
            value={formik.values.username}
            onChange={formik.handleChange("username")}
          />
          <View style={{ marginTop: height * 0.01, marginBottom: 20 }}>
            <Text style={styles.label}>Password</Text>
            <InputText
              maxLength={30}
              placeholder="Enter password"
              value={formik.values.password}
              onChange={formik.handleChange("password")}
              name="password"
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.password && formik.touched.password}
              secureTextEntry={hidePassword}
              actionRight={() => (
                <TouchableOpacity
                  onPress={() => setHidePassword(!hidePassword)}
                >
                  {hidePassword ? <SvgEyeOutline /> : <SvgEye />}
                </TouchableOpacity>
              )}
            />
          </View>
          <Button
            onClick={() => {
              Keyboard.dismiss();
              formik.handleSubmit();
            }}
            style={styles.button}
          >
            Sign in
          </Button>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.05,
    zIndex: 10,
    flexDirection: "row",
    padding: 10,
  },
  content: {
    width: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width * 0.7,
    height: height * 0.25,
    resizeMode: "contain",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#E5D463",
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
  },
  toastContainer: {
    backgroundColor: "#F5F6F8",
    padding: 10,
    borderRadius: 10,
    width: "80%",
    alignSelf: "center",
    marginTop: 50,
  },
  toastText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  toastSuccessText: {
    color: "green",
    fontWeight: "bold",
    fontSize: 16,
  },
  toastErrorText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  debugText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 5,
  },
  locationStatusContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  // locationStatusCard: {
  //   backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //   borderRadius: 10,
  //   padding: 12,
  //   width: '90%',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  locationReady: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationAcquiring: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  locationStatusText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  loader: {
    marginRight: 8,
  },
  roleSelectorContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    width: "100%",
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
    color: "#868E96",
  },
  roleButtonTextActive: {
    color: "#343A40",
    fontWeight: "600",
  },
});

export default SignInScreen;
