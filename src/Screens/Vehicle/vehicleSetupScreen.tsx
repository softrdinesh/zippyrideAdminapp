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
  StyleSheet,
  Modal,
} from "react-native";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";

import {
  useEditVehicle,
  useGetVehicleById,
  useGetVehicleColors,
  useGetVehicleTypes,
  useSetupVehicle,
  useAdminSetupVehicle,
  useAdminEditVehicle,
} from "../../services/api";
import Loader from "../../uikit/Loader/Loader";
import CommonModal from "../../uikit/CommonModal";
import SvgCameraIcon from "../../icons/SvgCameraIcon";
import ImageUploadModal from "../../uikit/ImageUploadModal/Index";
import CheckBox from "../../uikit/CheckBox/CheckBox";
import { useActiveOwnerId, useAuthStore } from "../../zustand/useAuthStore";
import InputText from "../../uikit/InputText/InputText";
import { colors } from "../../uikit/UikitUtils/colors"; // Import your colors
import { TYPOGRAPHY } from "../../theme/typography"; // Import your typography
import { useNavigation } from "@react-navigation/native";
import { useGetVehiclesByOwnerId, VehicleListItem } from "../../services/api";

// ... (validationSchema remains the same)
const validationSchema = Yup.object().shape({
  Vehno: Yup.string()
    .matches(
      /^[A-Za-z0-9]{10}$/,
      "Vehicle number must be 10 alphanumeric characters"
    )
    .required("Vehicle number is required"),
  Chasisno: Yup.string()
    .max(20, "Chassis number must be at most 20 characters")
    .required("Chassis number is required"),
  EngineNo: Yup.string()
    .max(20, "Engine number must be at most 20 characters")
    .required("Engine number is required"),
  VehName: Yup.string().required("Vehicle name is required"),
  VehTypeId: Yup.number().required("Type is required"),
  VehcolorId: Yup.number().required("Vehicle color is required"),
  Others: Yup.string().max(500, "Remarks must be at most 500 characters"),
  FcexpiryDate: Yup.date().required("FC expiry date is required"),
  VehPicFile: Yup.string().required("Vehicle image is required"),
});

const VehicleSetupScreen = ({ route }) => {
  // ... (all your hooks and logic remain the same)
  const { vehicleId } = route.params || {};
  const isEdit = vehicleId !== undefined;
  const navigation = useNavigation();
  const modalRef = useRef(null);
  const activeOwnerId = useActiveOwnerId();
  const [showInfoModal, setShowInfoModal] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });
 
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { setIsVehicleTag, userProfile, userRole } = useAuthStore();

  const { data, isLoading: isLoadingVehicleDetails } =
    useGetVehicleById(vehicleId);
  const { data: colorsData, isLoading: isLoadingColors } =
    useGetVehicleColors();
  const { data: types, isLoading: isLoadingTypes } = useGetVehicleTypes();

  const setupVehicleMutation = useSetupVehicle();
  const editVehicleMutation = useEditVehicle();
  const adminSetupVehicleMutation = useAdminSetupVehicle();
  const adminEditVehicleMutation = useAdminEditVehicle();

  const isLoading =
    isLoadingVehicleDetails ||
    setupVehicleMutation.isPending ||
    editVehicleMutation.isPending ||
    adminSetupVehicleMutation.isPending ||
    adminEditVehicleMutation.isPending ||
    isLoadingTypes ||
    isLoadingColors;
   
  const {
    data: vehicles,
    refetch,
    isFetching: isLoadingVehicles,
  } = useGetVehiclesByOwnerId(activeOwnerId);

  // Check vehicle limit when component mounts and when vehicles data changes
  useEffect(() => {
    if (!isEdit && vehicles && userProfile?.vehicleAttachLimit) {
      const currentVehicleCount = vehicles.length || 0;
      const vehicleLimit = userProfile.vehicleAttachLimit;
      
      console.log(currentVehicleCount, vehicleLimit, 'Vehicle count vs limit');
      
      if (currentVehicleCount >= vehicleLimit) {
        setShowLimitModal(true);
      }
    }
  }, [vehicles, userProfile?.vehicleAttachLimit, isEdit, navigation]);

  const handleLimitModalClose = () => {
    setShowLimitModal(false);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const formik = useFormik({
    initialValues: {
      Vehno: "",
      Chasisno: "",
      EngineNo: "",
      VehName: "",
      VehcolorId: "",
      VehTypeId: "",
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
        // Check vehicle limit before submitting for new vehicles
        if (!isEdit && vehicles && userProfile?.vehicleAttachLimit) {
          const currentVehicleCount = vehicles.length || 0;
          const vehicleLimit = userProfile.vehicleAttachLimit;
          
          if (currentVehicleCount >= vehicleLimit) {
            setShowLimitModal(true);
            return;
          }
        }

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
        formData.append("OwnerId", activeOwnerId);

        console.log("Submitting Vehicle Setup Form:", formData);

        let response = null;

        if (userRole === "admin") {
          formData.append("LoginuserID", userProfile.id); // The logged-in admin's ID
          formData.append("IsActive", true);

          if (isEdit) {
            formData.append("VehicleID", vehicleId);

            response = await adminEditVehicleMutation.mutateAsync(formData);
          } else {
            response = await adminSetupVehicleMutation.mutateAsync(formData);
          }
        } else {
          // User is an owner
          if (isEdit) {
            formData.append("VehicleID", vehicleId);
            formData.append("isActive", true);
            response = await editVehicleMutation.mutateAsync(formData);
          } else {
            formData.append("CreateDate", moment().format("YYYY-MM-DD"));
            formData.append("UpdateDate", moment().format("YYYY-MM-DD"));
            response = await setupVehicleMutation.mutateAsync(formData);
          }
        }
        // EXISTING CODE
        // if (vehicleId) {
        //   formData.append("VehicleID", vehicleId);
        //   formData.append("isActive", true);
        //   response = await editVehicleMutation.mutateAsync(formData);
        // } else {
        //   formData.append("CreateDate", moment().format("YYYY-MM-DD"));
        //   formData.append("UpdateDate", moment().format("YYYY-MM-DD"));
        //   response = await setupVehicleMutation.mutateAsync(formData);
        // }

        console.log("Vehicle Setup Response:", response);

        if (response?.code === 5999) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: response?.message || "Vehicle setup completed successfully",
          });
          if (vehicleId) {
            navigation.goBack();
            return;
          }
          Alert.alert(
            "Success",
            "Vehicle added successfully. Do you want to add another one?",
            [
              {
                text: "No",
                onPress: () => {
                  resetForm();
                  setIsVehicleTag(true);
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  }
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
              response?.message ||
              `Failed to ${
                vehicleId ? "edit" : "add"
              } vehicle. Please try again.`,
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
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
 const handleVehicleNumberchange = (text) => {
    // Remove spaces from the input but preserve original case
    const cleanedText = text.replace(/\s/g, '');
    formik.setFieldValue("Vehno", cleanedText);
  };
 const handleVehicleenginenumber = (text) => {
    // Remove spaces from the input but preserve original case
    const cleanedText = text.replace(/\s/g, '');
    formik.setFieldValue("EngineNo", cleanedText);
  };

   const handlechasisnumber = (text) => {
    // Remove spaces from the input but preserve original case
    const cleanedText = text.replace(/\s/g, '');
    formik.setFieldValue("Chasisno", cleanedText);
  };



  useEffect(() => {
    if (data && vehicleId && colorsData && types) {
      formik.setValues({
        Vehno: data.vehno || "",
        Chasisno: data.chasisno || "",
        EngineNo: data.engineNo || "",
        VehName: data.vehName || "",
        VehcolorId:
          colorsData?.find((c) => c.colname === data.colour)?.colourId || "",
        VehTypeId:
          types?.find((c) => c.vehTypeName === data.vehicleType)?.typeId || "",
        IsHybrid: data.isHybrid || false,
        IsPetrolVech: data.isPetrolVech || false,
        IsCngenabled: data.isCngenabled || false,
        IsDesielvech: data.isDesielvech || false,
        IsEv: data.isEv || false,
        Others: data.others || "",
        FcexpiryDate: data.fcExpiryDate
          ? moment(data.fcExpiryDate, "DD/MM/YYYY").toDate()
          : new Date(),
        VehPicFile: data.vehiclePicture || "",
      });
    }
  }, [data, vehicleId, colorsData, types]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {isLoading && <Loader />}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* ... (JSX remains the same, but styles will be updated) ... */}
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
            <Text style={styles.addVehicleImage}>
              {isEdit ? "Edit" : "Add"} Vehicle Photo
            </Text>
            {formik.touched.VehPicFile && formik.errors.VehPicFile && (
              <Text style={styles.errorText}>{formik.errors.VehPicFile}</Text>
            )}
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Vehicle Name</Text>
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
              maxLength={10}
              placeholder="Enter your vehicle number"
              value={formik.values.Vehno}
              // onChange={formik.handleChange("Vehno")}
            onChange={handleVehicleNumberchange}
              containerStyle={styles.input}
            />
            <Text style={styles.label}>Type</Text>
            <Dropdown
              style={[
                styles.dropdown,
                formik.touched.VehTypeId && formik.errors.VehTypeId
                  ? styles.errorBorder
                  : undefined,
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={types || []}
              search
              maxHeight={300}
              labelField="vehTypeName"
              valueField="typeId"
              placeholder="Select type"
              searchPlaceholder="Search type..."
              value={formik.values.VehTypeId}
              onChange={(item) =>
                formik.setFieldValue("VehTypeId", item.typeId)
              }
              itemTextStyle={styles.dropdownItemText}
              activeColor="#f5f5f5"
            />
            {formik.touched.VehTypeId && formik.errors.VehTypeId && (
              <Text style={styles.errorText}>{formik.errors.VehTypeId}</Text>
            )}
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
              data={colorsData || []}
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
             // onChange={formik.handleChange("EngineNo")}
              containerStyle={styles.input}
                       onChange={handleVehicleenginenumber}

            />
            <Text style={styles.label}>Chasis number</Text>
            <InputText
              name={"Chasisno"}
              touched={formik.touched}
              errors={formik.errors}
              error={formik.errors.Chasisno && formik.touched.Chasisno}
              maxLength={20}
              placeholder="Enter your chasis number"
              value={formik.values.Chasisno}
            //  onChange={formik.handleChange("Chasisno")}
              containerStyle={styles.input}
         onChange={handlechasisnumber}

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
                  ? moment(formik.values.FcexpiryDate).format("DD-MM-YYYY")
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
                label={"Petrol"}
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
                  ? `${isEdit ? "Editing" : "Adding"} Vehicle Details...`
                  : "Submit Vehicle Details"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {/* Professional Limit Modal */}
      <Modal
        visible={showLimitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLimitModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.limitModalContainer}>
            <View style={styles.limitModalHeader}>
              <Text style={styles.limitModalTitle}>Limit Reached</Text>
            </View>
            <View style={styles.limitModalBody}>
              <Text style={styles.limitModalMessage}>
                You have reached your vehicle limit of {userProfile?.vehicleAttachLimit}. 
                You cannot add more vehicles.
              </Text>
            </View>
            <View style={styles.limitModalFooter}>
              <TouchableOpacity
                style={styles.limitModalButton}
                onPress={handleLimitModalClose}
                activeOpacity={0.8}
              >
                <Text style={styles.limitModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
        buttonTextColorIOS={colors.brand.primary}
        customHeaderIOS={() => (
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select FC Expiry Date</Text>
          </View>
        )}
      />
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
    </KeyboardAvoidingView>
  );
};

// Styles updated to use TYPOGRAPHY and colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.white,
  },
  contentContainer: {
    paddingBottom: 40,
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
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.base.white,
    shadowColor: colors.base.black,
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
    backgroundColor: colors.brand.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.base.white,
  },
  addVehicleImage: {
    ...TYPOGRAPHY.body,
    color: colors.gray[600],
    marginTop: 12,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vehicleCheckboxes: {
    paddingVertical: 12,
    gap: 8,
  },
  addressInput: {
    height: 100,
    paddingTop: 12,
  },
  dropdown: {
    height: 50,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.base.white,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  placeholderStyle: {
    ...TYPOGRAPHY.body,
    color: colors.gray[300],
  },
  selectedTextStyle: {
    ...TYPOGRAPHY.body,
    color: colors.text.primary,
  },
  inputSearchStyle: {
    ...TYPOGRAPHY.body,
    height: 40,
    backgroundColor: colors.base.white,
  },
  dropdownItemText: {
    ...TYPOGRAPHY.body,
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  errorBorder: {
    borderColor: colors.status.error,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: colors.status.error,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
  },
  datePickerHeader: {
    width: "100%",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.base.white,
  },
  datePickerTitle: {
    ...TYPOGRAPHY.title,
  },
  dateInput: {
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 50,
  },
  dateText: {
    ...TYPOGRAPHY.body,
    color: colors.text.primary,
  },
  // Professional Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  limitModalContainer: {
    backgroundColor: colors.base.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  limitModalHeader: {
    backgroundColor: "#F6A003",
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  limitModalTitle: {
    ...TYPOGRAPHY.title,
    color: colors.base.white,
    fontSize: 20,
    fontWeight: '600',
  },
  limitModalBody: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  limitModalMessage: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: colors.text.primary,
    lineHeight: 24,
    fontSize: 16,
  },
  limitModalFooter: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  limitModalButton: {
    backgroundColor: "#F6A003",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitModalButtonText: {
    ...TYPOGRAPHY.button,
    color: colors.base.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleSetupScreen;