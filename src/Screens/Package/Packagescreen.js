import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { TYPOGRAPHY } from "../../theme/typography";
import axios from 'axios';
import { config } from '../../services/config';
import { useAuthStore } from "../../zustand/useAuthStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
const { width, height } = Dimensions.get("window");
import { colors } from "../../uikit/UikitUtils/colors";

// Responsive scale functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

const GOOGLE_API_KEY = "AIzaSyDyIPNKYpe9zG_JlEEhl070cC28N0q4qbc";

const PackageCreationScreen = () => {
  const [packageName, setPackageName] = useState("");

  const navigation = useNavigation()
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [oneWayDrop, setOneWayDrop] = useState(true);
  const [twoWayDrop, setTwoWayDrop] = useState(true);
  const [oneWayPrice, setOneWayPrice] = useState("");
  const [twoWayPrice, setTwoWayPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { userProfile } = useAuthStore();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [packages, setpackages] = useState([]);
  const hasCheckedLimit = useRef(false);

  // Function to fetch suggestions from Google Places API
  const fetchPlaces = async (text, setSuggestions) => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&types=(cities)&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();
      if (data.status === "OK") {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.log("Places API Error:", error);
    }
  };

  const useGetPackagesByOwnerId = async() => {
    try {
      const response = await axios.get(
        `${config.BASE_URL}GetPackagelistbyOwner?OwnerID=${userProfile?.id}`
      );
      console.log(response.data.length,'value');
      setpackages(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  };

  // Use useFocusEffect to check limit every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const checkLimit = async () => {
        if (!userProfile?.id || !userProfile?.outstationPackageLimit) {
          return;
        }

        const fetchedPackages = await useGetPackagesByOwnerId();
        const currentPackageCount = fetchedPackages?.length || 0;
        const packageLimit = userProfile.outstationPackageLimit;
        
        console.log(currentPackageCount, packageLimit, 'Package count vs limit');
        
        if (currentPackageCount >= packageLimit) {
          // Small delay to ensure modal shows properly
          setTimeout(() => {
            setShowLimitModal(true);
          }, 300);
        }
      };

      checkLimit();

      // Cleanup function
      return () => {
        hasCheckedLimit.current = false;
      };
    }, [userProfile?.id, userProfile?.outstationPackageLimit])
  );

  const handleLimitModalClose = () => {
    setShowLimitModal(false);
    // Delay navigation slightly to allow modal to close smoothly
    setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, 100);
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Package Name validation
    if (!packageName.trim()) {
      newErrors.packageName = "Trip Package name is required";
    } else if (packageName.trim().length < 2) {
      newErrors.packageName = "Trip Package name must be at least 2 characters";
    }

    // From City validation
    if (!fromCity.trim()) {
      newErrors.fromCity = "From city is required";
    }

    // To City validation
    if (!toCity.trim()) {
      newErrors.toCity = "To city is required";
    }

    // Check if from and to cities are the same
    if (fromCity.trim().toLowerCase() === toCity.trim().toLowerCase() && fromCity.trim() !== "") {
      newErrors.toCity = "From and To cities cannot be the same";
    }

    // One Way Price validation
    if (oneWayDrop) {
      if (!oneWayPrice.trim()) {
        newErrors.oneWayPrice = "One way price is required when one way Trip is enabled";
      } else if (isNaN(oneWayPrice) || parseFloat(oneWayPrice) <= 0) {
        newErrors.oneWayPrice = "One way price must be a valid positive number";
      }
    }

    // Two Way Price validation - Only validate if twoWayDrop is enabled
    if (twoWayDrop) {
      if (!twoWayPrice.trim()) {
        newErrors.twoWayPrice = "Two way price is required when two way Trip is enabled";
      } else if (isNaN(twoWayPrice) || parseFloat(twoWayPrice) <= 0) {
        newErrors.twoWayPrice = "Two way price must be a valid positive number";
      }
    }

    // Check if at least one drop type is selected
    if (!oneWayDrop && !twoWayDrop) {
      newErrors.dropTypes = "At least one Trip type (One Trip or Two Trip) must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call to create package using Axios with FormData
  const createPackage = async (formData) => {
    setLoading(true);
    try {
    
      const response = await axios.post(
        `${config.BASE_URL}CreateOutstationPackage`, 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "accept": "*/*",
          },
          timeout: 10000,
        }
      );
      navigation.navigate("PackageListScreen")

      return response.data;

    } catch (error) {
      console.error("Full Axios Error:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      
      // Handle different types of axios errors
      if (error.response) {
        // Server responded with error status
        const serverMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
        throw new Error(serverMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("No response from server. Please check your connection and server URL.");
      } else {
        // Other errors
        throw new Error(error.message || "Failed to create package");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare form data using FormData object for multipart/form-data
      const formData = new FormData();
      
      formData.append('Packagename', packageName.trim());
      formData.append('Fromcity', fromCity.trim());
      formData.append('Tocity', toCity.trim());
      formData.append('IsOneway', oneWayDrop.toString());
      formData.append('IsTwoWay', twoWayDrop.toString());
      formData.append('OwnerID', userProfile.id);
      formData.append('OnewayPrice', oneWayDrop ? oneWayPrice : '0');
      formData.append('TwowayPrice', twoWayDrop ? twoWayPrice : '0');
      formData.append('LoginUserID', userProfile.id);

      // Make API call with Axios
      const result = await createPackage(formData);

      // Success handling - Show modal instead of Alert
      setSuccessMessage("Trip Package created successfully!");
      setShowSuccessModal(true);

    } catch (error) {
      // Error handling
      console.error("Submission Error:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to create package. Please try again."
      );
    }
  };

  // Reset form function
  const resetForm = () => {
    setPackageName("");
    setFromCity("");
    setToCity("");
    setOneWayDrop(true);
    setTwoWayDrop(true);
    setOneWayPrice("");
    setTwoWayPrice("");
    setErrors({});
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  // Clear error when user starts typing
  const handlePackageNameChange = (text) => {
    setPackageName(text);
    if (errors.packageName) {
      setErrors(prev => ({ ...prev, packageName: "" }));
    }
  };

  const handleFromCityChange = (text) => {
    setFromCity(text);
    fetchPlaces(text, setFromSuggestions);
    if (errors.fromCity || errors.toCity) {
      setErrors(prev => ({ 
        ...prev, 
        fromCity: "",
        toCity: prev.toCity && prev.toCity.includes("cannot be the same") ? "" : prev.toCity
      }));
    }
  };

  const handleToCityChange = (text) => {
    setToCity(text);
    fetchPlaces(text, setToSuggestions);
    if (errors.toCity) {
      setErrors(prev => ({ 
        ...prev, 
        toCity: "",
        fromCity: prev.fromCity && prev.fromCity.includes("cannot be the same") ? "" : prev.fromCity
      }));
    }
  };

  const handleOneWayPriceChange = (text) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setOneWayPrice(cleanedText);
    if (errors.oneWayPrice) {
      setErrors(prev => ({ ...prev, oneWayPrice: "" }));
    }
  };

  const handleTwoWayPriceChange = (text) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setTwoWayPrice(cleanedText);
    if (errors.twoWayPrice) {
      setErrors(prev => ({ ...prev, twoWayPrice: "" }));
    }
  };

  const handleOneWayToggle = () => {
    setOneWayDrop(!oneWayDrop);
    if (errors.dropTypes) {
      setErrors(prev => ({ ...prev, dropTypes: "" }));
    }
    if (!oneWayDrop && errors.oneWayPrice) {
      setErrors(prev => ({ ...prev, oneWayPrice: "" }));
    }
  };

  const handleTwoWayToggle = () => {
    const newTwoWayDrop = !twoWayDrop;
    setTwoWayDrop(newTwoWayDrop);
    
    // Clear twoWayPrice when twoWayDrop is turned off
    if (!newTwoWayDrop) {
      setTwoWayPrice("");
    }
    
    if (errors.dropTypes) {
      setErrors(prev => ({ ...prev, dropTypes: "" }));
    }
    if (!newTwoWayDrop && errors.twoWayPrice) {
      setErrors(prev => ({ ...prev, twoWayPrice: "" }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Create Package</Text>

          {/* Package Name */}
          <Text style={styles.label}>Trip Package Name</Text>
          <View style={[styles.inputContainer, errors.packageName && styles.inputError]}>
            <Svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L2 7v13h20V7l-10-5zM12 22v-9l8-4.5V17l-8 5z"
                stroke="#333"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <TextInput
              placeholder="Trip Package Name"
              value={packageName}
              onChangeText={handlePackageNameChange}
              style={styles.textInput}
              placeholderTextColor="#999"
              maxLength={25}
            />
          </View>
          {errors.packageName && <Text style={styles.errorText}>{errors.packageName}</Text>}

          {/* From City */}
          <Text style={styles.label}>From City</Text>
          <View style={[styles.inputContainer, errors.fromCity && styles.inputError]}>
            <Svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="#333"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 11a2 2 0 100-4 2 2 0 000 4z"
                stroke="#333"
                strokeWidth={1.8}
              />
            </Svg>
            <TextInput
              placeholder="Search From City"
              value={fromCity}
              onChangeText={handleFromCityChange}
              style={styles.textInput}
              placeholderTextColor="#999"
              maxLength={50}
            />
          </View>
          {errors.fromCity && <Text style={styles.errorText}>{errors.fromCity}</Text>}

          {/* From Suggestions */}
          {fromSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={fromSuggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => {
                      setFromCity(item.description);
                      setFromSuggestions([]);
                      if (errors.fromCity) {
                        setErrors(prev => ({ ...prev, fromCity: "" }));
                      }
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* To City */}
          <Text style={styles.label}>To City</Text>
          <View style={[styles.inputContainer, errors.toCity && styles.inputError]}>
            <Svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="#333"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 11a2 2 0 100-4 2 2 0 000 4z"
                stroke="#333"
                strokeWidth={1.8}
              />
            </Svg>
            <TextInput
              placeholder="Search To City"
              value={toCity}
              onChangeText={handleToCityChange}
              style={styles.textInput}
              placeholderTextColor="#999"
              maxLength={50}
            />
          </View>
          {errors.toCity && <Text style={styles.errorText}>{errors.toCity}</Text>}

          {/* To Suggestions */}
          {toSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={toSuggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => {
                      setToCity(item.description);
                      setToSuggestions([]);
                      if (errors.toCity) {
                        setErrors(prev => ({ ...prev, toCity: "" }));
                      }
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Drop Types Error */}
          {errors.dropTypes && <Text style={styles.errorText}>{errors.dropTypes}</Text>}

          {/* One Way Drop */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>One Way Trip</Text>
            <TouchableOpacity
              style={[styles.toggleButton, oneWayDrop && styles.toggleActive]}
              onPress={handleOneWayToggle}
            >
              <Text style={[styles.toggleText, oneWayDrop && styles.toggleTextActive]}>
                {oneWayDrop ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* One Way Price */}
          {oneWayDrop && (
            <>
              <Text style={styles.label}>One Way Price</Text>
              <View style={[styles.inputContainer, errors.oneWayPrice && styles.inputError]}>
                <Svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 1v22M5 12h14"
                    stroke="#333"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <TextInput
                  placeholder="One Way Trip Price"
                  keyboardType="decimal-pad"
                  value={oneWayPrice}
                  onChangeText={handleOneWayPriceChange}
                  style={styles.textInput}
                  placeholderTextColor="#999"
                />
              </View>
              {errors.oneWayPrice && <Text style={styles.errorText}>{errors.oneWayPrice}</Text>}
            </>
          )}

          {/* Two Way Drop */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Two Way Trip</Text>
            <TouchableOpacity
              style={[styles.toggleButton, twoWayDrop && styles.toggleActive]}
              onPress={handleTwoWayToggle}
            >
              <Text style={[styles.toggleText, twoWayDrop && styles.toggleTextActive]}>
                {twoWayDrop ? "Yes" : "No"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Two Way Price */}
          {twoWayDrop && (
            <>
              <Text style={styles.label}>Two Way Price</Text>
              <View style={[styles.inputContainer, errors.twoWayPrice && styles.inputError]}>
                <Svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 1v22M5 12h14"
                    stroke="#333"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <TextInput
                  placeholder="Two Way Trip Price"
                  keyboardType="decimal-pad"
                  value={twoWayPrice}
                  onChangeText={handleTwoWayPriceChange}
                  style={styles.textInput}
                  placeholderTextColor="#999"
                />
              </View>
              {errors.twoWayPrice && <Text style={styles.errorText}>{errors.twoWayPrice}</Text>}
            </>
          )}

          {/* Submit */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>Create Package</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
                You have reached your package limit of {userProfile?.outstationPackageLimit}. 
                You cannot add more packages.
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

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Success</Text>
            </View>
            <View style={styles.modalBody}>
              <Svg width={scale(60)} height={scale(60)} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M22 4L12 14.01l-3-3"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.modalMessage}>{successMessage}</Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleSuccessModalClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA500" />
            <Text style={styles.loadingText}>Creating Package...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PackageCreationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
  },
  header: {
    fontSize: scale(18),
    fontWeight: "700",
    ...TYPOGRAPHY.title,
    marginVertical: verticalScale(12),
    color: "#222",
    textAlign: "center",
  },
  label: {
    fontSize: scale(13),
    fontWeight: "600",
    ...TYPOGRAPHY.body,
    color: "#444",
    marginBottom: verticalScale(4),
    marginTop: verticalScale(12),
  },
  inputContainer: {
    flexDirection: "row",
    ...TYPOGRAPHY.body,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    marginTop: verticalScale(4),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  textInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: scale(14),
    color: "#000",
    paddingVertical: verticalScale(2),
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: scale(8),
    marginTop: verticalScale(2),
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxHeight: verticalScale(150),
  },
  suggestionItem: {
    padding: verticalScale(10),
    ...TYPOGRAPHY.body,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  suggestionText: {
    ...TYPOGRAPHY.body,
    fontSize: scale(13),
    color: "#333",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(4),
  },
  toggleLabel: {
    fontSize: scale(14),
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: "#333",
  },
  toggleButton: {
    paddingHorizontal: scale(14),
    ...TYPOGRAPHY.body,
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
    backgroundColor: "#E5E5E5",
    minWidth: scale(60),
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#FFA500",
  },
  toggleText: {
    color: "#222",
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    fontSize: scale(12),
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#FFA500",
    paddingVertical: verticalScale(16),
    borderRadius: scale(10),
    alignItems: "center",
    marginTop: verticalScale(24),
    shadowColor: "#FFA500",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#FFC04D",
    opacity: 0.7,
  },
  submitText: {
    color: "white",
    fontSize: scale(15),
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: scale(12),
    marginTop: verticalScale(4),
    marginLeft: scale(4),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: scale(12),
    width: "100%",
    maxWidth: scale(300),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  modalBody: {
    padding: scale(24),
    alignItems: "center",
  },
  modalMessage: {
    fontSize: scale(14),
    color: "#666",
    textAlign: "center",
    marginTop: verticalScale(12),
    lineHeight: scale(20),
  },
  modalFooter: {
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  modalButton: {
    backgroundColor: "#FFA500",
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: scale(16),
    fontWeight: "600",
  },
  // Loading Overlay Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: scale(30),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(200),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: scale(16),
    color: '#333',
    fontWeight: '600',
  },
  // Professional Limit Modal Styles
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