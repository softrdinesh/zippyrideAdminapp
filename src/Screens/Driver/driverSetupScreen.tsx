import React, { useState, useRef, useEffect, useCallback } from "react";
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
  SafeAreaView,
} from "react-native";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment";

// import { useGetVehiclesForDropdown, useCreateDriver } from '../../services/api';
import Loader from "../../uikit/Loader/Loader";
import ImageUploadModal from "../../uikit/ImageUploadModal/Index";
import CheckBox from "../../uikit/CheckBox/CheckBox";
import { useActiveOwnerId } from "../../zustand/useAuthStore";
import InputText from "../../uikit/InputText/InputText";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import SvgCameraIcon from "../../icons/SvgCameraIcon";
import { useCreateDriver, useEditDriver } from "../../services/api/driver";
import { useGetVehiclesByOwnerId } from "../../services/api";
import {
  StackActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import PhoneInputText from "../../uikit/PhoneInputText/PhoneInputText";

const validationSchema = Yup.object().shape({
  Username: Yup.string().required("Username is required"),
  Drivername: Yup.string().required("Driver name is required"),
  Licenseno: Yup.string().required("License number is required"),
  Mobileno: Yup.string().required("Mobile Number is required"),
  Whatsappno: Yup.string().required("Whatsapp Number is required"),
  Licenseexpirydate: Yup.date().required("License expiry date is required"),
  // Address: Yup.string().required("Address is required"),
  VehicleID: Yup.number().required("A vehicle must be assigned"),
  DriverPicFile: Yup.string().required("Driver photo is required"),
});

const DriverSetupScreen = ({ route }) => {
  const navigation = useNavigation();
  const mobileInputRef = useRef();
  const whatsappInputRef = useRef();
  const { driver } = route.params || {};
  const isEdit = !!driver;

  const modalRef = useRef(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");

  const activeOwnerId = useActiveOwnerId();
  const {
    data: vehicles,
    refetch,
    isLoading: isLoadingVehicles,
  } = useGetVehiclesByOwnerId(activeOwnerId);
  const createDriverMutation = useCreateDriver();
  const editDriverMutation = useEditDriver();

  const isLoading =
    isLoadingVehicles ||
    createDriverMutation.isPending ||
    editDriverMutation.isPending;

  const formik = useFormik({
    initialValues: {
      Drivername: "",
      Username: "",
      Mobileno: "",
      Whatsappno: "",
      Gpayno: "",
      Paytmno: "",
      Telegarmid: "",
      Licenseno: "",
      Licenseexpirydate: new Date(),
      Address: "",
      VehicleID: "",
      IsFemailDriver: false,
      DriverPicFile: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log("SUBMITED ==>", values);

        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          if (key === "DriverPicFile" && values.DriverPicFile) {
            const imageName = values.DriverPicFile.split("/").pop();
            const ext = imageName.split(".").pop();
            const imageType = ext ? `image/${ext}` : "image";
            formData.append("DriverPicFile", {
              uri: values.DriverPicFile,
              name: imageName,
              type: imageType,
            });
          } else if (key === "Licenseexpirydate") {
            formData.append(key, moment(values[key]).toISOString());
          } else {
            formData.append(key, values[key]);
          }
        });

        formData.append("OwnerID", activeOwnerId);

        let response;
        if (isEdit) {
          formData.append("LoginUserID", activeOwnerId);
          formData.append("IsActive", true);
          formData.append("DriverID", driver.driverID);
          response = await editDriverMutation.mutateAsync(formData);
        } else {
          response = await createDriverMutation.mutateAsync(formData);
        }
        console.log("RESPONSE ==>", response);

        if (response?.code === 5999) {
          // Check for a successful response
          Toast.show({
            type: "success",
            text1: "Success",
            text2: `Driver ${isEdit ? "updated" : "created"} successfully`,
          });
          resetForm();
          navigation.dispatch(StackActions.popToTop());
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              response?.message ||
              `Failed to ${isEdit ? "update" : "create"} driver.`,
          });
        }
      } catch (error) {
        console.log("ERROR ==>", error);
        Toast.show({ type: "error", text1: "Error", text2: error.message });
      }
    },
  });

  useEffect(() => {
    if (isEdit && driver && vehicles) {
      console.log("driver", driver);

      formik.setValues({
        Drivername: driver.drivername || "",
        Username: driver.riderLoginAccountname || "",
        Mobileno: driver.mobileNo || "",
        Whatsappno: driver.whatsappno || "",
        Gpayno: driver.gpayno || "",
        Paytmno: driver.paytmno || "",
        Telegarmid: driver.telegramID || "",
        Licenseno: driver.licenseNo || "",
        Licenseexpirydate: driver.licenseExpirydate
          ? moment(driver.licenseExpirydate, "DD-MM-YYYY").toDate()
          : new Date(),
        Address: driver.riderAddress || "",
        VehicleID: driver.vehId || "",
        IsFemailDriver: driver.isFemale === 1,
        DriverPicFile: driver.riderpic || "",
      });
      if (mobileInputRef.current) {
        mobileInputRef.current.setState({
          ...mobileInputRef.current.state,
          number: driver.mobileNo.replace("+91", ""),
        });
      }
      if (whatsappInputRef.current) {
        whatsappInputRef.current.setState({
          ...whatsappInputRef.current.state,
          number: driver.whatsappno.replace("+91", ""),
        });
      }
    }
  }, [isEdit, driver, vehicles]);

  const handleImageSelected = (image) => {
    formik.setFieldValue("DriverPicFile", image.path);
  };

  const handleConfirmDate = (date) => {
    formik.setFieldValue("Licenseexpirydate", date);
    setDatePickerVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <Loader />}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.driverImageContainer}
                onPress={() => modalRef.current?.open()}
              >
                <Image
                  source={
                    formik.values.DriverPicFile
                      ? { uri: formik.values.DriverPicFile }
                      : require("../../assets/camera12.png")
                  }
                  style={styles.driverImage}
                />
                <View style={styles.cameraIcon}>
                  <SvgCameraIcon />
                </View>
              </TouchableOpacity>
              <Text style={styles.addDriverImage}>
                {isEdit ? "Edit" : "Add"} Driver Photo
              </Text>
              {formik.touched.DriverPicFile && formik.errors.DriverPicFile && (
                <Text style={styles.errorText}>
                  {formik.errors.DriverPicFile}
                </Text>
              )}
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Driver Name</Text>
              <InputText
                name="Drivername"
                placeholder="Enter driver's full name"
                maxLength={20}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.Drivername && formik.touched.Drivername}
                value={formik.values.Drivername}
                onChange={formik.handleChange("Drivername")}
                containerStyle={styles.input}
              />

              <Text style={styles.label}>Username</Text>
              <InputText
                name="Username"
                maxLength={10}
                placeholder="Fill user name"
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.Username && formik.touched.Username}
                value={formik.values.Username}
                onChange={formik.handleChange("Username")}
                containerStyle={styles.input}
              />

              <Text style={styles.label}>Mobile Number</Text>
              <PhoneInputText
                ref={mobileInputRef}
                placeholder="Enter mobile number"
                name={"mobileno"}
                error={formik.errors.Mobileno && formik.touched.Mobileno}
                onChangeCountry={(val) => {
                  setCountryCode("+" + val.callingCode[0]);
                }}
                value={formik.values.Mobileno}
                onChange={(text) => {
                  const numericValue = text.replace(/[^0-9+]/g, "");
                  formik.handleChange("Mobileno")(numericValue);
                }}
                containerStyle={styles.phoneInput}
              />
              {formik.touched.Mobileno && formik.errors.Mobileno && (
                <Text style={styles.errorText}>{formik.errors.Mobileno}</Text>
              )}

              <Text style={styles.label}>WhatsApp Number</Text>
              <PhoneInputText
                ref={whatsappInputRef}
                placeholder="Enter Whatsapp number"
                name={"Whatsappno"}
                error={formik.errors.Whatsappno && formik.touched.Whatsappno}
                onChangeCountry={(val) => {
                  setCountryCode("+" + val.callingCode[0]);
                }}
                value={formik.values.Whatsappno}
                onChange={(text) => {
                  const numericValue = text.replace(/[^0-9+]/g, "");
                  formik.handleChange("Whatsappno")(numericValue);
                }}
                containerStyle={styles.phoneInput}
              />
              {formik.touched.Whatsappno && formik.errors.Whatsappno && (
                <Text style={styles.errorText}>{formik.errors.Whatsappno}</Text>
              )}

              <Text style={styles.label}>Address</Text>
              <View>
                <InputText
                  overrideStyle={{ textAlignVertical: "top" }}
                  height={100}
                  numberOfLines={4}
                  multiline
                  maxLength={4000}
                  placeholder="Enter your full address"
                  value={formik.values.Address}
                  onChange={formik.handleChange("Address")}
                  name={"Address"}
                  touched={formik.touched}
                  errors={formik.errors}
                  error={formik.errors.Address && formik.touched.Address}
                  containerStyle={[styles.input, styles.addressInput]}
                />
              </View>

              <Text style={styles.label}>Assign Vehicle</Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  formik.touched.VehicleID &&
                    formik.errors.VehicleID &&
                    styles.errorBorder,
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={vehicles || []}
                labelField="vehName"
                valueField="vehID"
                placeholder="Select a vehicle"
                value={formik.values.VehicleID}
                onChange={(item) => {
                  formik.setFieldValue("VehicleID", item.vehID);
                  // formik.validateForm();
                }}
                itemTextStyle={styles.dropdownItemText}
              />
              {formik.touched.VehicleID && formik.errors.VehicleID && (
                <Text style={styles.errorText}>{formik.errors.VehicleID}</Text>
              )}

              <Text style={styles.label}>License Number</Text>
              <InputText
                name="Licenseno"
                placeholder="Enter driving license number"
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.Licenseno && formik.touched.Licenseno}
                maxLength={20}
                value={formik.values.Licenseno}
                onChange={formik.handleChange("Licenseno")}
                containerStyle={styles.input}
              />

              <Text style={styles.label}>License Expiry Date</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dateInput,
                  formik.touched.Licenseexpirydate &&
                    formik.errors.Licenseexpirydate &&
                    styles.errorBorder,
                ]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text
                  style={[
                    styles.dateText,
                    !formik.values.Licenseexpirydate && styles.placeholderStyle,
                  ]}
                >
                  {moment(formik.values.Licenseexpirydate).format("DD-MM-YYYY")}
                </Text>
              </TouchableOpacity>
              {formik.touched.Licenseexpirydate &&
                formik.errors.Licenseexpirydate && (
                  <Text style={styles.errorText}>
                    {formik.errors.Licenseexpirydate}
                  </Text>
                )}

              <Text style={styles.label}>GPay Number</Text>
              <InputText
                name="Gpayno"
                placeholder="GPay Number"
                keyboardType="numeric"
                maxLength={15}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.Gpayno && formik.touched.Gpayno}
                value={formik.values.Gpayno}
                onChange={formik.handleChange("Gpayno")}
                containerStyle={styles.input}
              />
              <Text style={styles.label}>Paytm Number</Text>
              <InputText
                name="Paytmno"
                placeholder="Paytm Number"
                keyboardType="numeric"
                maxLength={15}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.Paytmno && formik.touched.Paytmno}
                value={formik.values.Paytmno}
                onChange={formik.handleChange("Paytmno")}
                containerStyle={styles.input}
              />
              <Text style={styles.label}>Telegram ID</Text>
              <InputText
                name="Telegarmid"
                placeholder="Telegram ID"
                maxLength={15}
                touched={formik.touched}
                errors={formik.errors}
                error={formik.errors.Telegarmid && formik.touched.Telegarmid}
                value={formik.values.Telegarmid}
                onChange={formik.handleChange("Telegarmid")}
                containerStyle={styles.input}
              />

              <View style={styles.checkboxContainer}>
                <CheckBox
                  label={"Female Driver"}
                  checked={formik.values.IsFemailDriver}
                  onClick={() =>
                    formik.setFieldValue(
                      "IsFemailDriver",
                      !formik.values.IsFemailDriver
                    )
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={formik.handleSubmit}
              >
                <Text style={styles.buttonText}>
                  {isEdit ? "Update Driver Details" : "Submit Driver Details"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ImageUploadModal
        modalRef={modalRef}
        onImageSelected={handleImageSelected}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
        date={formik.values.Licenseexpirydate || new Date()}
      />
    </SafeAreaView>
  );
};

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
  },
  driverImageContainer: {
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
  },
  driverImage: {
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
  addDriverImage: {
    ...TYPOGRAPHY.body,
    color: colors.gray[600],
    marginTop: 12,
  },
  formContainer: {
    paddingHorizontal: 24,
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
  checkboxContainer: {
    marginTop: 20,
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
  buttonText: {
    ...TYPOGRAPHY.button,
  },
  dateInput: {
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: colors.base.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
  },
  dateText: {
    ...TYPOGRAPHY.body,
    color: colors.text.primary,
  },
  addressInput: {
    height: 100,
    paddingTop: 12,
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
  dropdownItemText: {
    ...TYPOGRAPHY.body,
  },
});

export default DriverSetupScreen;
