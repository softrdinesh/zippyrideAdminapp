import React, { useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useGetVehicleById } from "../../services/api";
import { colors } from "../../uikit/UikitUtils/colors";
import SvgCarIcon from "../../icons/SvgCarIcon";
import { useFocusEffect } from "@react-navigation/native";

// A reusable component to display each detail item
const DetailRow = ({ label, value, isBoolean = false }) => {
  const displayValue = isBoolean ? (value ? "Yes" : "No") : value || "N/A";
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{displayValue}</Text>
    </View>
  );
};

// Main component for the Vehicle Detail Screen
const VehicleDetailScreen = ({ route }) => {
  const { vehicleId } = route.params;

  // 3. Fetch data using the hook
  const { data, isLoading, isError, error, refetch } =
    useGetVehicleById(vehicleId);

  // The actual vehicle data is likely nested in the response
  const vehicle = data;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loaderText}>Loading Vehicle Details...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Failed to load details.</Text>
        <Text style={styles.errorSubText}>
          {error?.message || "Unknown Error"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Vehicle Image and Primary Info */}
        <View style={styles.profileSection}>
          <View style={styles.vehicleImageContainer}>
            {vehicle.vehiclePicture ? (
              <Image
                source={{
                  uri: vehicle.vehiclePicture,
                }}
                style={styles.vehicleImage}
              />
            ) : (
              <SvgCarIcon size={50} color="#4267B2" />
            )}
          </View>
          <Text style={styles.vehicleName}>{vehicle.vehName}</Text>
          <Text style={styles.vehicleNumber}>{vehicle.vehno}</Text>
        </View>

        {/* Specifications Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specifications</Text>
          <DetailRow label="Chassis No." value={vehicle.chasisno} />
          <DetailRow label="Engine No." value={vehicle.engineNo} />
          <DetailRow label="Color" value={vehicle.colour} />
          <DetailRow label="Type" value={vehicle.vehicleType} />
        </View>
        {/* Status & Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status & Info</Text>
          <DetailRow label="Active" value={vehicle.isActive} isBoolean />
          <DetailRow label="Hybrid" value={vehicle.isHybrid} isBoolean />
          <DetailRow label="Petrol" value={vehicle.isPetrolVech} isBoolean />
          <DetailRow
            label="CNG Enabled"
            value={vehicle.isCngenabled}
            isBoolean
          />
          <DetailRow label="Electric (EV)" value={vehicle.isEv} isBoolean />
          <DetailRow label="Other Notes" value={vehicle.others} />
        </View>

        {/* Compliance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compliance</Text>
          <DetailRow label="FC Expiry Date" value={vehicle.fcExpiryDate} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // A light grey background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#212529",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "System",
  },
  headerActionPlaceholder: {
    width: 40,
  },
  contentContainer: {
    paddingBottom: 120, // Space for the footer buttons
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  vehicleImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#212529",
    marginTop: 16,
  },
  vehicleNumber: {
    fontSize: 16,
    color: "#868E96",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343A40",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#868E96",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#495057",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FA5252",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#4267B2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VehicleDetailScreen;
