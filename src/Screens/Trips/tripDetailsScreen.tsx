import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import { TripListItem } from "../../services/api/trips";

// --- Reusable Components ---
const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

const TripDetailsScreen = ({ route }: any) => {
  const { trip }: { trip: TripListItem } = route.params;

  console.log("TRIP DETAILS ==>", trip);

  // Derive status from the API response
  const isCancelled = !!trip.tripCanceldate && trip.tripCanceldate.length > 0;
  const status = isCancelled ? "Cancelled" : "Completed";

  const getStatusStyle = () => {
    if (isCancelled) return styles.statusCancelled;
    return styles.statusCompleted;
  };
  const statusStyle = getStatusStyle();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Rider & Vehicle Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rider & Vehicle</Text>
          <View style={styles.driverInfoContainer}>
            <Image
              source={{
                uri:
                  trip.driverPhoto ||
                  `https://placehold.co/60x60/png?font=poppins&text=${trip.ridername[0].toUpperCase()}`,
              }}
              style={styles.avatar}
              onError={(e) => {
                console.log("ERROR ==>", e);
              }}
            />
            <View>
              <Text style={styles.driverName}>{trip.ridername}</Text>
              <Text
                style={styles.vehicleInfo}
              >{`${trip.vehname} • ${trip.vehno}`}</Text>
            </View>
          </View>
        </View>

        {/* Route Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Details</Text>
          <View style={styles.routeTimeline}>
            {/* Start Point */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineGraphic}>
                <View style={[styles.timelineDot, styles.startDot]} />
                <View style={styles.timelineConnector} />
              </View>
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineLocation}>
                  {trip.pickupLocation}
                </Text>
              </View>
            </View>
            {/* End Point */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineGraphic}>
                <View style={[styles.timelineDot, styles.endDot]} />
              </View>
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineLocation}>{trip.dropLocation}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trip Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Summary</Text>
          <DetailRow label="Trip No." value={trip.tripNo} />
          <DetailRow label="Date" value={trip.tripdate} />
          <DetailRow label="Amount" value={`₹ ${trip.amount.toFixed(2)}`} />
          <DetailRow label="Payment" value={trip.paymentmethod} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, statusStyle.container]}>
              <Text style={[styles.statusText, statusStyle.text]}>
                {status}
              </Text>
            </View>
          </View>
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
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    marginBottom: 16,
  },
  driverInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: colors.gray[100],
  },
  driverName: {
    ...TYPOGRAPHY.title,
  },
  vehicleInfo: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginTop: 2,
  },
  routeTimeline: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineGraphic: {
    alignItems: "center",
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  startDot: {
    backgroundColor: colors.brand.primary,
  },
  endDot: {
    backgroundColor: colors.gray[400],
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: colors.gray[200],
    marginVertical: 4,
  },
  timelineDetails: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 12,
    paddingBottom: 24,
  },
  timelineLocation: {
    ...TYPOGRAPHY.body,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailLabel: {
    ...TYPOGRAPHY.body,
    color: colors.gray[500],
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "bold",
  },
  statusCompleted: {
    container: { backgroundColor: colors.status.success + "20" },
    text: { color: colors.status.success },
  },
  statusCancelled: {
    container: { backgroundColor: colors.status.error + "20" },
    text: { color: colors.status.error },
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

export default TripDetailsScreen;
