import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useSignup,
  useGetCountries,
  useGetLocations,
} from "../../services/api";

import PhoneInputText from "../../uikit/PhoneInputText/PhoneInputText";
import Loader from "../../uikit/Loader/Loader";
import SvgEyeOutline from "../../icons/SvgEyleOutLine";
import SvgEye from "../../icons/SvgEye";

import SvgCameraIcon from "../../icons/SvgCameraIcon";
import ImageUploadModal from "../../uikit/ImageUploadModal/Index";
import CommonModal from "../../uikit/CommonModal";
import { useAuthStore } from "../../zustand/useAuthStore";
import { colors } from "../../uikit/UikitUtils/colors";

const OwnerSetupScreen = () => {
  const phoneInput = useRef(null);
  const useridref = useRef(null);
  const modalRef = useRef(null);
  const navigation = useNavigation();
  const { userProfile, userRole } = useAuthStore();
  const isNormalAdmin = userRole === "admin" && !userProfile?.isSuperAdmin;

  const [hidePassword, setHidePassword] = useState(true);
  const [hidePassword1, setHidePassword1] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  const { data: countries, isPending: isLoadingCountries } = useGetCountries();
  const { data: allLocations, isPending: isLoadingLocations } =
    useGetLocations();
  const { mutateAsync: signupMutation, isPending: isSignupLoading } =
    useSignup();
  const isLoading = isSignupLoading || isLoadingCountries || isLoadingLocations;

  const SignUpSchema = Yup.object().shape({
    username: Yup.string().required("Name is required"),
    companyname: Yup.string().required("Company name is required"),
    telegarmid: Yup.string(),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .max(15, "Password Max is 15 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    mobileno: Yup.string().required("Mobile Number is required"),
    whatsappno: Yup.string(),
    address: Yup.string().required("Address is required"),
    country: Yup.string().required("Country is required"),
    profilepick: Yup.string().required("Profile image is required"),
    locationID: Yup.number().required("Location is required"),
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
      locationID: "",
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values) => {
      try {
        const formdata = new FormData();
        formdata.append("Mobileno", values.mobileno);
        formdata.append("Companyname", values.companyname);
        formdata.append("CountryID", values.country);
        formdata.append("LocationID", values.locationID);
        formdata.append("Whatsappno", values.whatsappno);

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
          setShowInfoModal({
            isOpen: true,
            message: "Owner account created successfully",
            type: "success",
          });
        } else {
          setShowInfoModal({
            isOpen: true,
            message: response?.message || "Owner account creation failed",
            type: "error",
          });
        }
      } catch (error) {
        console.log("Signup failed:", error);
        setShowInfoModal({
          isOpen: true,
          message: error?.message || "Something went wrong",
          type: "error",
        });
      }
    },
  });

  useEffect(() => {
    if (isNormalAdmin && userProfile) {
      formik.setFieldValue("country", userProfile.countryID);
      formik.setFieldValue("locationID", userProfile.locationID);
    }
  }, [isNormalAdmin, userProfile]);

  const filteredLocations = useMemo(() => {
    if (!formik.values.country || !allLocations) {
      return [];
    }

    return allLocations.filter(
      (location) => location.countryID === formik.values.country
    );
  }, [allLocations, formik.values.country]);

  const handleClose = () => {
    if (showInfoModal.type === "success") {
      formik.resetForm();
      navigation.goBack();
    }
    setShowInfoModal({ isOpen: false, message: "", type: "success" });
  };

  const handleImageSelected = (image) => {
    formik.setFieldValue("profilepick", image.path);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {isLoading && <Loader />}

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profilePhotoContainer}
                onPress={() => modalRef.current?.open()}
                activeOpacity={0.8}
              >
                <Image
                  source={
                    formik.values.profilepick
                      ? { uri: formik.values.profilepick }
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
                data={countries ?? []}
                disable={isNormalAdmin}
                search
                maxHeight={300}
                labelField="countryName"
                valueField="countryID"
                placeholder="Select country"
                searchPlaceholder="Search country..."
                value={formik.values.country}
                onChange={(item) => {
                  formik.setFieldValue("country", item.countryID);
                  formik.setFieldValue("locationID", "");
                }}
                itemTextStyle={styles.dropdownItemText}
                activeColor="#f5f5f5"
              />
              {formik.touched.country && formik.errors.country && (
                <Text style={styles.errorText}>{formik.errors.country}</Text>
              )}
              <Text style={styles.label}>Location</Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  formik.errors.locationID &&
                    formik.touched.locationID &&
                    styles.errorBorder,
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                disable={isNormalAdmin}
                data={filteredLocations ?? []}
                maxHeight={300}
                labelField="locationName"
                valueField="locationID"
                placeholder={
                  !formik.values.country
                    ? "Select a country first"
                    : "Select location"
                }
                value={formik.values.locationID}
                onChange={(item) =>
                  formik.setFieldValue("locationID", item.locationID)
                }
                itemTextStyle={styles.dropdownItemText}
                disable={!formik.values.country || isLoadingLocations}
              />
              {formik.touched.locationID && formik.errors.locationID && (
                <Text style={styles.errorText}>{formik.errors.locationID}</Text>
              )}

              <TouchableOpacity
                style={[styles.button]}
                onPress={formik.handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isSignupLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
        <CommonModal
          isOpen={showInfoModal.isOpen}
          onClose={handleClose}
          type={showInfoModal.type}
          message={showInfoModal.message}
        />
        <ImageUploadModal
          modalRef={modalRef}
          onImageSelected={handleImageSelected}
        />
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
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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

export default OwnerSetupScreen;
