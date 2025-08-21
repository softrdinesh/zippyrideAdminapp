import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import InputText from "../../uikit/InputText/InputText";
import { Modalize } from "react-native-modalize";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ImagePicker from "react-native-image-crop-picker";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SvgBack from "../../icons/SvgBack";

import Geolocation from "@react-native-community/geolocation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { useSignup } from "../../services/api";

import PhoneInputText from "../../uikit/PhoneInputText/PhoneInputText";
import Loader from "../../uikit/Loader/Loader";
import SvgEyeOutline from "../../icons/SvgEyleOutLine";
import SvgEye from "../../icons/SvgEye";
import Registererrormodal from "./registererror";
import RegisterSuccessModal from "./registersuccess";
import { getAxiosErrorMessage } from "../../uikit/UikitUtils/helpers";
import SvgCameraIcon from "../../icons/SvgCameraIcon";

const { width, height } = Dimensions.get("window");

const Register = () => {
  const phoneInput = useRef(null);
  const [isSuccess, setSuccess] = useState(false);
  const colorScheme = useColorScheme();
  const modalizeRef = useRef(null);
  const navigation = useNavigation();
  const { mutateAsync: signupMutation, isPending: isSignupLoading } =
    useSignup();
  const isLoading = isSignupLoading;
  const [countryCode, setCountryCode] = useState("+91");

  const [profilepick, setprofilepick] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hidePassword1, setHidePassword1] = useState(true);
  const [isfailer, setisfailer] = useState(false);
  const [failermessage, setfailermessage] = useState("");
  const useridref = useRef(null);
  const [loading, setloading] = useState(false);
  const [countrylist, setcountrylist] = useState([]);
  const [locationlist, setlocationlist] = useState([]);

  useEffect(() => {
    getCurrentLocation();
    Countryinfo();
  }, []);

  const Countryinfo = async () => {
    try {
      const response = await axios.get(
        `https://uat.zippyrideuserapi.projectpulse360.com/api/users/GetCountryList`
      );
      const formattedCountries = response.data.map((country) => ({
        label: country.countryName,
        value: country.countryid,
      }));
      console.log(formattedCountries, "formattedCountries");

      setcountrylist(formattedCountries);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  const getCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const SignUpSchema = Yup.object().shape({
    username: Yup.string().required("Name is required"),
    companyname: Yup.string().required("Company name is required"),
    telegarmid: Yup.string(),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .max(15, "Password Max is 15 characters")
      // .matches(
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
      //   'Password must contain at least one uppercase letter, one lowercase letter, and one digit'
      // )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    mobileno: Yup.string().required("Mobile Number is required"),
    whatsappno: Yup.string(),
    address: Yup.string().required("Address is required"),
    country: Yup.string().required("Country is required"),
    profilepick: Yup.string().required("Profile image is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      companyname: "",
      telegarmid: "",
      password: "",
      confirmPassword: "",
      whatsappno: "",
      mobileno: "",
      address: "",
      country: "",
      profilepick: "",
      // location: ''
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values) => {
      setloading(true);
      try {
        const formdata = new FormData();
        formdata.append("Profilepic", "");
        formdata.append("Mobileno", values.mobileno);
        formdata.append("Companyname", values.companyname);
        formdata.append("CountryID", values.country);
        formdata.append("Whatsappno", values.whatsappno);
        // Attach image if selected, with dynamic name and type
        if (values.profilepick) {
          const imageName = values.profilepick.split("/").pop();
          const ext = imageName.split(".").pop();
          const imageType = ext ? `image/${ext}` : "image";
          formdata.append("OwnerPicFile", {
            uri: values.profilepick,
            name: imageName,
            type: imageType,
          });
        }
        formdata.append("Address", values.address);
        formdata.append("Username", values.username);
        formdata.append("Telegarmid", values.telegarmid);
        formdata.append("Password", values.password);
        console.log("Form data:", formdata);

        const response = await signupMutation(formdata);

        if (response && response.ownerID) {
          useridref.current = response.ownerID;
          setSuccess(true);
        } else {
          setisfailer(true);
          setfailermessage(response?.message || "Signup failed");
        }
      } catch (error) {
        console.error("Signup failed:", error);
        setisfailer(true);
        setfailermessage(getAxiosErrorMessage(error));
      } finally {
        setloading(false);
      }
    },
  });

  //   if (!image || !useridref.current) return;

  //   setIsLoading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append('file', {
  //       uri: image.path,
  //       name: image.filename || `profile_${Date.now()}.jpg`,
  //       type: image.mime || 'image/jpeg',
  //     });

  //     await axios.post(
  //       `https://uat.zippyrideuserapi.projectpulse360.com/api/users/Uploadsignupuserpic/${useridref.current}`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Accept: 'application/json',
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleClose = () => {
    navigation.navigate("Login");
    setSuccess(false);
    formik.resetForm();
  };

  const handleClose1 = () => {
    setisfailer(false);
  };

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const onClose = () => {
    modalizeRef.current?.close();
  };

  const handleImageSelection = async (source) => {
    try {
      const options = {
        width: 300,
        height: 400,
        cropping: true,
        multiple: false,
        mediaType: "photo",
      };

      const image =
        source === "camera"
          ? await ImagePicker.openCamera(options)
          : await ImagePicker.openPicker(options);

      if (image) {
        setprofilepick(image.path);
        formik.setFieldValue("profilepick", image.path);
        if (useridref.current) {
          await uploadProfileImage(image);
        }
      }
      onClose();
    } catch (error) {
      console.log("Image selection error:", error);
      if (error.code !== "E_PICKER_CANCELLED") {
        Toast.show({
          type: "error",
          text1: "Error selecting image",
          text2: error.message || "Please try again",
        });
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {isSignupLoading && <Loader />}
        {loading && <Loader />}
        {isLoading && <Loader />}

        <RegisterSuccessModal open={isSuccess} close={handleClose} />
        <Registererrormodal
          open={isfailer}
          close={handleClose1}
          message={failermessage}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                // style={styles.backButton}
                // hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
              >
                <SvgBack height={15} width={15} />
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profilePhotoContainer}
                onPress={onOpen}
                activeOpacity={0.8}
              >
                <Image
                  source={
                    profilepick
                      ? { uri: profilepick }
                      : require("../../assets/camera12.png")
                  }
                  style={styles.profilePhoto}
                />
                <View style={styles.cameraIcon}>
                  <SvgCameraIcon />
                </View>
              </TouchableOpacity>
              <Text style={styles.profileText}>Add Profile Photo</Text>
              {formik.touched.profilepick && formik.errors.profilepick && (
                <Text style={styles.errorText}>
                  {formik.errors.profilepick}
                </Text>
              )}
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Full Name</Text>
              <InputText
                name={"username"}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.username && formik.touched.username}
                maxLength={20}
                placeholder="Enter your full name"
                value={formik.values.username}
                onChange={formik.handleChange("username")}
                containerStyle={styles.input}
              />

              <Text style={styles.label}>Company Name</Text>
              <InputText
                name={"companyname"}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.companyname && formik.touched.companyname}
                maxLength={50}
                placeholder="Enter your company name"
                value={formik.values.companyname}
                onChange={formik.handleChange("companyname")}
                containerStyle={styles.input}
              />

              <View style={styles.passwordRow}>
                <View style={styles.passwordColumn}>
                  <Text style={styles.label}>Password</Text>
                  <InputText
                    maxLength={30}
                    placeholder="Create password"
                    value={formik.values.password}
                    onChange={formik.handleChange("password")}
                    name={"password"}
                    touched={formik.touched}
                    errors={formik.errors}
                    error={formik.errors.password && formik.touched.password}
                    secureTextEntry={hidePassword}
                    actionRight={() => (
                      <TouchableOpacity
                        onPress={() => setHidePassword(!hidePassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {hidePassword ? <SvgEyeOutline /> : <SvgEye />}
                      </TouchableOpacity>
                    )}
                    containerStyle={styles.input}
                  />
                </View>

                <View style={styles.passwordColumn}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <InputText
                    maxLength={30}
                    placeholder="Confirm password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange("confirmPassword")}
                    name={"confirmPassword"}
                    touched={formik.touched}
                    errors={formik.errors}
                    error={
                      formik.errors.confirmPassword &&
                      formik.touched.confirmPassword
                    }
                    secureTextEntry={hidePassword1}
                    actionRight={() => (
                      <TouchableOpacity
                        onPress={() => setHidePassword1(!hidePassword1)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {hidePassword1 ? <SvgEyeOutline /> : <SvgEye />}
                      </TouchableOpacity>
                    )}
                    containerStyle={styles.input}
                  />
                </View>
              </View>

              <Text style={styles.label}>Mobile Number</Text>
              <PhoneInputText
                ref={phoneInput}
                placeholder="Enter mobile number"
                name={"mobileno"}
                error={formik.errors.mobileno && formik.touched.mobileno}
                onChangeCountry={(val) => {
                  setCountryCode("+" + val.callingCode[0]);
                }}
                value={formik.values.mobileno}
                onChange={(text) => {
                  const numericValue = text.replace(/[^0-9+]/g, "");
                  formik.handleChange("mobileno")(numericValue);
                }}
                containerStyle={styles.phoneInput}
              />
              {formik.touched.mobileno && formik.errors.mobileno && (
                <Text style={styles.errorText}>{formik.errors.mobileno}</Text>
              )}

              <Text style={styles.label}>Whatsapp Number</Text>
              <PhoneInputText
                ref={phoneInput}
                placeholder="Enter Whatsapp number"
                name={"whatsappno"}
                error={formik.errors.whatsappno && formik.touched.whatsappno}
                onChangeCountry={(val) => {
                  setCountryCode("+" + val.callingCode[0]);
                }}
                value={formik.values.whatsappno}
                onChange={(text) => {
                  const numericValue = text.replace(/[^0-9+]/g, "");
                  formik.handleChange("whatsappno")(numericValue);
                }}
                containerStyle={styles.phoneInput}
              />
              {formik.touched.whatsappno && formik.errors.whatsappno && (
                <Text style={styles.errorText}>{formik.errors.whatsappno}</Text>
              )}

              <Text style={styles.label}>Address</Text>
              <InputText
                overrideStyle={{ textAlignVertical: "top" }}
                height={100}
                numberOfLines={4}
                multiline
                maxLength={4000}
                placeholder="Enter your address"
                value={formik.values.address}
                onChange={formik.handleChange("address")}
                name={"address"}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.address && formik.touched.address}
                containerStyle={[styles.input, styles.addressInput]}
              />
              <Text style={styles.label}>Telegram ID (Optional)</Text>
              <InputText
                name={"telegarmid"}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.telegarmid && formik.touched.telegarmid}
                maxLength={50}
                placeholder="Enter your Telegram username"
                value={formik.values.telegarmid}
                onChange={formik.handleChange("telegarmid")}
                containerStyle={styles.input}
              />
              <Text style={styles.label}>Country</Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  formik.errors.country &&
                    formik.touched.country &&
                    styles.errorBorder,
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={countrylist}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select country"
                searchPlaceholder="Search country..."
                value={formik.values.country}
                onChange={(item) => formik.setFieldValue("country", item.value)}
                itemTextStyle={styles.dropdownItemText}
                activeColor="#f5f5f5"
              />
              {formik.touched.country && formik.errors.country && (
                <Text style={styles.errorText}>{formik.errors.country}</Text>
              )}

              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.link}>Terms of Service</Text> and{" "}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  //  (!formik.isValid || isSignupLoading) && styles.buttonDisabled
                ]}
                onPress={formik.handleSubmit}
                activeOpacity={0.8}
                //   disabled={!formik.isValid || isSignupLoading}
              >
                <Text style={styles.buttonText}>
                  {isSignupLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <Modalize
          ref={modalizeRef}
          modalHeight={height * 0.25}
          adjustToContentHeight={false}
          withHandle={true}
          handlePosition="inside"
          handleStyle={styles.modalHandle}
          modalStyle={styles.modalStyle}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleImageSelection("camera")}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.modalIcon}>
                  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                    <Circle cx="24" cy="24" r="24" fill="#F6A000" />
                    <Path
                      d="M16 20C16 18.8954 16.8954 18 18 18H19L20.4472 16.1056C20.7865 15.6322 21.3704 15.3333 22 15.3333H26C26.6296 15.3333 27.2135 15.6322 27.5528 16.1056L29 18H30C31.1046 18 32 18.8954 32 20V28C32 29.1046 31.1046 30 30 30H18C16.8954 30 16 29.1046 16 28V20Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.modalOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleImageSelection("gallery")}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.modalIcon}>
                  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                    <Circle cx="24" cy="24" r="24" fill="#F6A000" />
                    <G transform="translate(13, 14.5)">
                      <Path
                        d="M0 2.71429C0 1.99441 0.289731 1.30402 0.805456 0.794996C1.32118 0.285969 2.02065 0 2.75 0H19.25C19.9793 0 20.6788 0.285969 21.1945 0.794996C21.7103 1.30402 22 1.99441 22 2.71429V16.2857C22 17.0056 21.7103 17.696 21.1945 18.205C20.6788 18.714 19.9793 19 19.25 19H2.75C2.02065 19 1.32118 18.714 0.805456 18.205C0.289731 17.696 0 17.0056 0 16.2857V2.71429ZM1.375 14.9286V16.2857C1.375 16.6457 1.51987 16.9908 1.77773 17.2454C2.03559 17.4999 2.38533 17.6429 2.75 17.6429H19.25C19.6147 17.6429 19.9644 17.4999 20.2223 17.2454C20.4801 16.9908 20.625 16.6457 20.625 16.2857V11.5357L15.4316 8.89336C15.3027 8.8296 15.1567 8.80749 15.0143 8.83014C14.8719 8.85279 14.7404 8.91906 14.6383 9.01957L9.537 14.0546L5.8795 11.6497C5.74745 11.5629 5.58905 11.5239 5.43117 11.5392C5.27328 11.5546 5.12563 11.6233 5.01325 11.7339L1.375 14.9286ZM8.25 6.10714C8.25 5.56724 8.0327 5.04945 7.64591 4.66768C7.25911 4.2859 6.73451 4.07143 6.1875 4.07143C5.64049 4.07143 5.11589 4.2859 4.72909 4.66768C4.3423 5.04945 4.125 5.56724 4.125 6.10714C4.125 6.64705 4.3423 7.16484 4.72909 7.54661C5.11589 7.92838 5.64049 8.14286 6.1875 8.14286C6.73451 8.14286 7.25911 7.92838 7.64591 7.54661C8.0327 7.16484 8.25 6.64705 8.25 6.10714Z"
                        fill="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </G>
                  </Svg>
                </View>
                <Text style={styles.modalOptionText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modalize>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F1F3F5",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    textAlign: "center",
    flex: 1,
    fontFamily: "System",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 24,
  },
  profilePhotoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#F6A000",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileText: {
    fontSize: 14,
    color: "#495057",
    marginTop: 12,
    fontWeight: "500",
    fontFamily: "System",
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#343A40",
    marginBottom: 8,
    marginTop: 12,
    fontFamily: "System",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  passwordColumn: {
    width: "100%",
  },
  phoneInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addressInput: {
    height: 100,
    paddingTop: 12,
  },
  dropdown: {
    height: 50,
    borderColor: "#DEE2E6",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#ADB5BD",
    fontFamily: "System",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#212529",
    fontFamily: "System",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    color: "#212529",
    backgroundColor: "#FFFFFF",
    fontFamily: "System",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#212529",
    fontFamily: "System",
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  errorBorder: {
    borderColor: "#FA5252",
  },
  errorText: {
    color: "#FA5252",
    fontSize: 12,
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: "System",
  },
  termsText: {
    fontSize: 12,
    color: "#868E96",
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 18,
    fontFamily: "System",
  },
  link: {
    color: "#4267B2",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4267B2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#4267B2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#ADB5BD",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#495057",
    fontFamily: "System",
  },
  loginLink: {
    fontSize: 14,
    color: "#4267B2",
    fontWeight: "600",
    fontFamily: "System",
  },
  modalStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
    marginTop: 12,
    alignSelf: "center",
  },
  modalContent: {
    padding: 24,
    paddingBottom: 32,
  },
  modalOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  modalOption: {
    alignItems: "center",
    width: "40%",
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F6A000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOptionText: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "System",
  },
});

export default Register;
