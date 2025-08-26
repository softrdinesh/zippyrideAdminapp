import React, { useCallback } from "react";
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
import { TYPOGRAPHY } from "../../theme/typography"; // Import your typography styles

// A reusable component for key-value pairs
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

// A new component for displaying boolean features in a grid
const FeatureBox = ({ label, value }) => {
  if (!value) return null; // Don't render if the feature is false
  return (
    <View style={styles.featureBox}>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
};

const VehicleDetailScreen = ({ route }) => {
  const { vehicleId } = route.params;
  const {
    data: vehicle,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetVehicleById(vehicleId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]) // Added refetch to dependency array
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loaderText}>Loading Vehicle Details...</Text>
      </View>
    );
  }

  if (isError || !vehicle) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Failed to load details.</Text>
        <Text style={styles.errorSubText}>
          {error?.message || "An unknown error occurred."}
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
        {/* Main Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.vehicleImageContainer}>
            {vehicle.vehiclePicture ? (
              <Image
                source={{ uri: vehicle.vehiclePicture }}
                style={styles.vehicleImage}
              />
            ) : (
              <SvgCarIcon size={60} color={colors.brand.primary} />
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

        {/* Features Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <FeatureBox label="Electric (EV)" value={vehicle.isEv} />
            <FeatureBox label="Hybrid" value={vehicle.isHybrid} />
            <FeatureBox label="Petrol" value={vehicle.isPetrolVech} />
            <FeatureBox label="Diesel" value={vehicle.isDesielvech} />
            <FeatureBox label="CNG Enabled" value={vehicle.isCngenabled} />
            <FeatureBox label="Active" value={vehicle.isActive} />
          </View>
        </View>

        {/* Compliance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compliance</Text>
          <DetailRow label="FC Expiry Date" value={vehicle.fcExpiryDate} />
        </View>

        {/* Other details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Other Details</Text>
          <Text style={styles.notesText}>{vehicle.others}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  vehicleImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.base.white,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  vehicleName: {
    ...TYPOGRAPHY.header,
    marginTop: 16,
  },
  vehicleNumber: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  detailLabel: {
    ...TYPOGRAPHY.label,
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    color: colors.text.primary,
    fontWeight: "500",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 8,
  },
  featureBox: {
    backgroundColor: colors.brand.primary + "20", // Primary color with opacity
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureText: {
    ...TYPOGRAPHY.caption,
    color: colors.brand.primary,
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  notesLabel: {
    ...TYPOGRAPHY.label,
    marginBottom: 8,
  },
  notesText: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[100],
  },
  loaderText: {
    ...TYPOGRAPHY.body,
    marginTop: 16,
  },
  errorText: {
    ...TYPOGRAPHY.header,
    color: colors.status.error,
  },
  errorSubText: {
    ...TYPOGRAPHY.body,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    ...TYPOGRAPHY.title,
    fontSize: 16,
    color: colors.base.white,
  },
});

export default VehicleDetailScreen;
