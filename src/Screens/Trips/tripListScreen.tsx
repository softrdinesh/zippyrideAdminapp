import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import Svg, { Path } from "react-native-svg";

// --- Dummy Data (to be replaced by API data) ---
const dummyTrips = [
  {
    id: "1",
    driverName: "John Doe",
    vehicleNo: "MH12AB1234",
    startLocation: "Main St, Downtown",
    endLocation: "Oak Ave, Suburbs",
    date: "2025-08-26",
    status: "Completed",
  },
  {
    id: "2",
    driverName: "Jane Smith",
    vehicleNo: "DL8CM6789",
    startLocation: "Central Park",
    endLocation: "Westside Highway",
    date: "2025-08-26",
    status: "In Progress",
  },
  {
    id: "3",
    driverName: "Peter Jones",
    vehicleNo: "CH01A1234",
    startLocation: "Airport Terminal 2",
    endLocation: "Grand Hotel",
    date: "2025-08-25",
    status: "Completed",
  },
  {
    id: "4",
    driverName: "John Doe",
    vehicleNo: "HR26AB1234",
    startLocation: "City Mall",
    endLocation: "Industrial Area",
    date: "2025-08-24",
    status: "Cancelled",
  },
];

// --- SVG Icons for Filters ---
const FilterIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
      fill={colors.gray[600]}
    />
  </Svg>
);
const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5a6.5 6.5 0 10-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      fill={colors.gray[400]}
    />
  </Svg>
);

// --- Reusable Components ---
const TripCard = ({ item, onPress }) => {
  const statusStyle =
    item.status === "Completed"
      ? styles.statusCompleted
      : item.status === "In Progress"
      ? styles.statusInProgress
      : styles.statusCancelled;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.driverName}>{item.driverName}</Text>
        <View style={[styles.statusBadge, statusStyle.container]}>
          <Text style={[styles.statusText, statusStyle.text]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.vehicleNumber}>{item.vehicleNo}</Text>
      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>From:</Text>
          <Text style={styles.locationText}>{item.startLocation}</Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>To:</Text>
          <Text style={styles.locationText}>{item.endLocation}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>{item.date}</Text>
    </TouchableOpacity>
  );
};

const FilterButton = ({ label, onPress, active }) => (
  <TouchableOpacity
    style={[styles.filterButton, active && styles.filterButtonActive]}
    onPress={onPress}
  >
    <Text
      style={[styles.filterButtonText, active && styles.filterButtonTextActive]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// --- Main Screen Component ---
const TripListScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // e.g., 'All', 'Completed', 'In Progress'

  // Memoized filtering logic
  const filteredTrips = useMemo(() => {
    let trips = dummyTrips;

    if (activeFilter !== "All") {
      trips = trips.filter((trip) => trip.status === activeFilter);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      trips = trips.filter(
        (trip) =>
          trip.driverName.toLowerCase().includes(lowercasedQuery) ||
          trip.vehicleNo.toLowerCase().includes(lowercasedQuery)
      );
    }

    return trips;
  }, [searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Driver or Vehicle..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <FilterIcon />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: 8 }}
        >
          <FilterButton
            label="All"
            active={activeFilter === "All"}
            onPress={() => setActiveFilter("All")}
          />
          <FilterButton
            label="Completed"
            active={activeFilter === "Completed"}
            onPress={() => setActiveFilter("Completed")}
          />
          <FilterButton
            label="In Progress"
            active={activeFilter === "In Progress"}
            onPress={() => setActiveFilter("In Progress")}
          />
          <FilterButton
            label="Cancelled"
            active={activeFilter === "Cancelled"}
            onPress={() => setActiveFilter("Cancelled")}
          />
        </ScrollView>
      </View>

      {/* Trip List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripCard
            item={item}
            onPress={() =>
              navigation.navigate("TripDetailsScreen", { tripId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.base.white,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    ...TYPOGRAPHY.body,
    flex: 1,
    height: 48,
    marginLeft: 8,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filterButton: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  filterButtonActive: {
    backgroundColor: colors.brand.primary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.caption,
    color: colors.gray[600],
  },
  filterButtonTextActive: {
    color: colors.base.white,
  },
  listContainer: {
    padding: 24,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  driverName: {
    ...TYPOGRAPHY.title,
  },
  vehicleNumber: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginBottom: 12,
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
  statusInProgress: {
    container: { backgroundColor: colors.brand.secondary + "30" },
    text: { color: "#A67C00" },
  },
  statusCancelled: {
    container: { backgroundColor: colors.status.error + "20" },
    text: { color: colors.status.error },
  },
  routeContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    marginTop: 8,
    paddingTop: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationLabel: {
    ...TYPOGRAPHY.label,
    color: colors.gray[500],
    width: 50,
  },
  locationText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    textAlign: "right",
    marginTop: 8,
    color: colors.gray[400],
  },
});

export default TripListScreen;
