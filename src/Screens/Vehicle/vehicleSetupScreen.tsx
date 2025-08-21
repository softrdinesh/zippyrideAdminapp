import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useGetVehicleColors, useSetupVehicle } from "../../services/api";

import Loader from "../../uikit/Loader/Loader";
import { getAxiosErrorMessage } from "../../uikit/UikitUtils/helpers";
import CommonModal from "../../uikit/CommonModal";
import SvgCameraIcon from "../../icons/SvgCameraIcon";
import ImageUploadModal from "../../uikit/ImageUploadModal/Index";
import CheckBox from "../../uikit/CheckBox/CheckBox";
import { useAuthStore } from "../../zustand/useAuthStore";
import InputText from "../../uikit/InputText/InputText";
import moment from "moment";

const validationSchema = Yup.object().shape({
  Vehno: Yup.string()
    .matches(
      /^[A-Za-z0-9]{8}$/,
      "Vehicle number must be 8 alphanumeric characters"
    )
    .required("Vehicle number is required"),
  Chasisno: Yup.string()
    .max(20, "Chassis number must be at most 20 characters")
    .required("Chassis number is required"),
  EngineNo: Yup.string()
    .max(20, "Engine number must be at most 20 characters")
    .required("Engine number is required"),
  VehName: Yup.string().required("Vehicle name is required"),
  VehcolorId: Yup.number().required("Vehicle color is required"),
  Others: Yup.string().max(500, "Remarks must be at most 500 characters"),
  FcexpiryDate: Yup.date().required("FC expiry date is required"),
  VehPicFile: Yup.string().required("Vehicle image is required"),
});

const Register = () => {
  const navigation = useNavigation();
  const modalRef = useRef(null);

  const [showInfoModal, setShowInfoModal] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const { ownerProfile } = useAuthStore();
  const { data: colors, isLoading: isLoadingColors } = useGetVehicleColors();
  const setupVehicleMutation = useSetupVehicle();

  const isLoading = setupVehicleMutation.isPending || isLoadingColors;

  const formik = useFormik({
    initialValues: {
      Vehno: "",
      Chasisno: "",
      EngineNo: "",
      VehName: "",
      VehcolorId: "",
      IsHybrid: false,
      IsPetrolVech: false,
      IsCngenabled: false,
      IsDesielvech: false,
      IsEv: false,
      Others: "",
      FcexpiryDate: new Date(),
      VehPicFile: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        // Append all form values
        Object.keys(values).forEach((key) => {
          if (key === "VehPicFile" && values.VehPicFile) {
            const imageName = values.VehPicFile.split("/").pop();
            const ext = imageName.split(".").pop();
            const imageType = ext ? `image/${ext}` : "image";
            formData.append("VehPicFile", {
              uri: values.VehPicFile,
              name: imageName,
              type: imageType,
            });
          } else if (key === "FcexpiryDate") {
            formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
          } else {
            formData.append(key, values[key]);
          }
        });

        // Add required fields
        formData.append("OwnerId", ownerProfile.id);
        formData.append("CreateDate", moment().format("YYYY-MM-DD"));
        formData.append("UpdateDate", moment().format("YYYY-MM-DD"));
        console.log("Submitting Vehicle Setup Form:", formData);

        const response = await setupVehicleMutation.mutateAsync(formData);
        console.log("Vehicle Setup Response:", response);

        if (response?.code === 5999) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: response?.message || "Vehicle setup completed successfully",
          });

          Alert.alert(
            "Success",
            "Vehicle added successfully. Do you want to add another one?",
            [
              {
                text: "No",
                onPress: () => {
                  resetForm();
                  navigation.replace("Main"); // Navigate to the main dashboard
                },
                style: "cancel",
              },
              { text: "Yes", onPress: () => resetForm() },
            ],
            { cancelable: false }
          );
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              response?.message || "Failed to add vehicle. Please try again.",
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: getAxiosErrorMessage(error),
        });
      }
    },
  });

  const handleImageSelected = (image) => {
    console.log("Selected image:", image);
    // Handle the selected image
    formik.setFieldValue("VehPicFile", image.path);
  };

  const handleConfirm = (date) => {
    formik.setFieldValue("FcexpiryDate", date);
    setDatePickerVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {isLoading && <Loader />}

      <CommonModal
        isOpen={showInfoModal.isOpen}
        onClose={() =>
          setShowInfoModal({
            isOpen: false,
            type: "success",
            message: "",
          })
        }
        type={showInfoModal.type}
        message={showInfoModal.message}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add Vehicle</Text>
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.vehicleImageContainer}
              onPress={() => modalRef.current?.open()}
              activeOpacity={0.8}
            >
              <Image
                source={
                  formik.values.VehPicFile
                    ? { uri: formik.values.VehPicFile }
                    : require("../../assets/camera12.png")
                }
                style={styles.vehicleImage}
              />
              <View style={styles.cameraIcon}>
                <SvgCameraIcon />
              </View>
            </TouchableOpacity>
            <Text style={styles.addVehicleImage}>Add Vehicle Photo</Text>
            {formik.touched.VehPicFile && formik.errors.VehPicFile && (
              <Text style={styles.errorText}>{formik.errors.VehPicFile}</Text>
            )}
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Vehical Name</Text>
            <InputText
              name={"VehName"}
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.VehName && formik.touched.VehName}
              maxLength={20}
              placeholder="Enter your vehical name"
              value={formik.values.VehName}
              onChange={formik.handleChange("VehName")}
              containerStyle={styles.input}
            />

            <Text style={styles.label}>Vehicle number</Text>
            <InputText
              name={"Vehno"}
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.Vehno && formik.touched.Vehno}
              maxLength={8}
              placeholder="Enter your vehicle number"
              value={formik.values.Vehno}
              onChange={formik.handleChange("Vehno")}
              containerStyle={styles.input}
            />
            <Text style={styles.label}>Color</Text>
            <Dropdown
              style={[
                styles.dropdown,
                formik.touched.VehcolorId && formik.errors.VehcolorId
                  ? styles.errorBorder
                  : undefined,
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={colors || []}
              search
              maxHeight={300}
              labelField="colname"
              valueField="colourId"
              placeholder="Select color"
              searchPlaceholder="Search color..."
              value={formik.values.VehcolorId}
              onChange={(item) =>
                formik.setFieldValue("VehcolorId", item.colourId)
              }
              itemTextStyle={styles.dropdownItemText}
              activeColor="#f5f5f5"
            />
            {formik.touched.VehcolorId && formik.errors.VehcolorId && (
              <Text style={styles.errorText}>{formik.errors.VehcolorId}</Text>
            )}

            <Text style={styles.label}>Engine number</Text>
            <InputText
              name={"EngineNo"}
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.EngineNo && formik.touched.EngineNo}
              maxLength={20}
              placeholder="Enter your engine number"
              value={formik.values.EngineNo}
              onChange={formik.handleChange("EngineNo")}
              containerStyle={styles.input}
            />
            <Text style={styles.label}>Chasis number</Text>
            <InputText
              name={"Chasisno"}
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.Chasisno && formik.touched.Chasisno}
              maxLength={8}
              placeholder="Enter your chasis number"
              value={formik.values.Chasisno}
              onChange={formik.handleChange("Chasisno")}
              containerStyle={styles.input}
            />
            <Text style={styles.label}>FC Expiry Date</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dateInput,
                formik.touched.FcexpiryDate &&
                  formik.errors.FcexpiryDate &&
                  styles.errorBorder,
              ]}
              onPress={() => setDatePickerVisible(true)}
            >
              <Text
                style={[
                  styles.dateText,
                  !formik.values.FcexpiryDate && styles.placeholderStyle,
                ]}
              >
                {formik.values.FcexpiryDate
                  ? formik.values.FcexpiryDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select FC expiry date"}
              </Text>
            </TouchableOpacity>
            {formik.touched.FcexpiryDate && formik.errors.FcexpiryDate && (
              <Text style={styles.errorText}>{formik.errors.FcexpiryDate}</Text>
            )}
            <Text style={styles.label}>Other details</Text>
            <InputText
              overrideStyle={{ textAlignVertical: "top" }}
              height={100}
              numberOfLines={4}
              multiline
              maxLength={4000}
              placeholder="Enter your Other details"
              value={formik.values.Others}
              onChange={formik.handleChange("Others")}
              name={"Others"}
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.Others && formik.touched.Others}
              containerStyle={[styles.input, styles.addressInput]}
            />
            <View style={styles.vehicleCheckboxes}>
              <CheckBox
                label={"EV"}
                checked={formik.values.IsEv}
                disabled={
                  formik.values.IsCngenabled ||
                  formik.values.IsPetrolVech ||
                  formik.values.IsDesielvech
                }
                onClick={() => {
                  formik.setFieldValue("IsEv", !formik.values.IsEv);
                }}
              />
              <CheckBox
                label={"Hybrid"}
                disabled={formik.values.IsEv}
                checked={formik.values.IsHybrid}
                onClick={() => {
                  formik.setFieldValue("IsHybrid", !formik.values.IsHybrid);
                }}
              />
              <CheckBox
                label={"Pertrol"}
                disabled={formik.values.IsEv || formik.values.IsDesielvech}
                checked={formik.values.IsPetrolVech}
                onClick={() => {
                  formik.setFieldValue(
                    "IsPetrolVech",
                    !formik.values.IsPetrolVech
                  );
                }}
              />
              <CheckBox
                label={"Diesel"}
                disabled={
                  formik.values.IsEv ||
                  formik.values.IsPetrolVech ||
                  formik.values.IsCngenabled
                }
                checked={formik.values.IsDesielvech}
                onClick={() => {
                  formik.setFieldValue(
                    "IsDesielvech",
                    !formik.values.IsDesielvech
                  );
                }}
              />
              <CheckBox
                label={"CNG"}
                checked={formik.values.IsCngenabled}
                disabled={formik.values.IsEv || formik.values.IsDesielvech}
                onClick={() => {
                  formik.setFieldValue(
                    "IsCngenabled",
                    !formik.values.IsCngenabled
                  );
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={formik.handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? "Adding Vehicle Details..."
                  : "Submit Vehicle Details"}
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
      <ImageUploadModal
        modalRef={modalRef}
        onImageSelected={handleImageSelected}
        imageOptions={{
          width: 500,
          height: 500,
          cropping: true,
        }}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
        minimumDate={new Date()}
        date={formik.values.FcexpiryDate || new Date()}
        buttonTextColorIOS="#4267B2"
        customHeaderIOS={() => (
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select FC Expiry Date</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
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
  vehicleImageContainer: {
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
  vehicleImage: {
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
  addVehicleImage: {
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

  vehicleCheckboxes: {
    paddingVertical: 12,
    gap: 5,
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
  datePickerHeader: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "System",
  },
  dateInput: {
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#212529",
    fontFamily: "System",
  },
  placeholderStyle: {
    color: "#ADB5BD",
  },
});

export default Register;
