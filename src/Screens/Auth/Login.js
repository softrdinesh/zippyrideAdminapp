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
import { useUserLoginMutation } from "../../services/Apiconfig";
// import { authenticateOwner, setFirstLogin } from "../../Reudx/slices/authSlice";
import { getItem, setItem } from "../../utils/mmkvStorage";
import Loader from "../../uikit/Loader/Loader";
import { useForgotPasswordOTPMutation } from "../../services/Apiconfig";
import { useLogin } from "../../services/api";
import { useAuthStore } from "../../zustand/useAuthStore";

const { width, height } = Dimensions.get("window");

const SignInScreen = () => {
  const navigation = useNavigation();
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const loginMutation = useLogin();
  // Replace Redux dispatch with Zustand
  const { authenticateOwner, setFirstLogin } = useAuthStore();

  const [ForgotMutation] = useForgotPasswordOTPMutation();
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
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
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
        const fcmToken = await messaging().getToken();
        const payload = {
          username: values.username,
          password: values.password,
          deviceToken: fcmToken,
          longtitude: locationRef.current.longitude?.toString(),
          latitude: locationRef.current.latitude?.toString(),
        };

        const response = await loginMutation.mutateAsync(payload);

        console.log("Login response:", response);

        if (!response?.loginStatus) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: response?.message || "Invalid credentials",
          });
          return;
        }
        // INFO: New code
        // Dispatch owner authentication
        authenticateOwner({
          id: response.ownerID.toString(),
          username: response.userName,
          token: response.tokenvalue,
          isFirstLogin: response.isFirstLogin,
        });

        // Show success toast
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Login successful",
          position: "top",
        });
        // Handle first login
        const isFirstTime = !getItem("isFirstLogin");
        if (isFirstTime) {
          setFirstLogin(true);
          setItem("isFirstLogin", "true");
        }

        // Store auth data
        setItem("token", `Bearer ${response.tokenvalue}`);

        // INFO: Earlier code
        // // Save user info
        // dispatch(login());
        // setItem("userdata", response.data.ownerID.toString());
        // // setItem("name", response.data.userName);
        // setItem("token", `Bearer ${response.data.tokenvalue}`);

        // Toast.show({
        //   type: "success",
        //   text1: "Success",
        //   text2: `${values.username} OTP sent successfully`,
        //   position: "top",
        // });

        // await Resendvalue(values.username);

        // // Navigate to OTP screen
        // setItem("email", values.username);
        // setItem("otpverified", "false");

        // // Navigate to OTP verification
        // navigation.navigate("Loginotpverificationscreen", {
        //   username: values.username,
        // });

        formik.resetForm();
      } catch (error) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: getAxiosErrorMessage(error),
        });
      }
    },
  });

  const Resendvalue = async (username) => {
    setLoading(true);
    try {
      const payload = { Email: username, OtpType: "SI" };
      const response = await ForgotMutation(payload);

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

          <Text style={styles.label}>Enter Username</Text>
          <InputText
            name="username"
            touched={formik.touched}
            errors={formik.errors}
            error={formik.errors.username && formik.touched.username}
            maxLength={50}
            keyboardType="text"
            placeholder="Enter username"
            value={formik.values.username}
            onChange={formik.handleChange("username")}
          />
          <View style={{ marginTop: height * 0.01 }}>
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

            <TouchableOpacity
              onPress={() => navigation.navigate("Forgotpassword")}
              style={styles.forgotStyle}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
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
  forgotStyle: {
    alignSelf: "flex-end",
    marginTop: 5,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 15,
    color: "#4A90E2",
    fontWeight: "500",
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
});

export default SignInScreen;
