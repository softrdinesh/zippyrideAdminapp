import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { debounce } from "lodash";

import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import { useAuthStore } from "../../zustand/useAuthStore";
import { useGetTripsByOwner, TripListItem } from "../../services/api/trips";
import SvgClose from "../../icons/SvgClose";

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

interface TripCardProps {
  item: TripListItem;
  onPress: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ item, onPress }) => {
  const statusStyle =
    item.status === "Completed"
      ? styles.statusCompleted
      : item.status === "Cancelled"
      ? styles.statusCancelled
      : styles.statusInProgress;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.driverName}>{item.ridername}</Text>
        {item.status && (
          <View style={[styles.statusBadge, statusStyle.container]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {item.status}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={styles.vehicleNumber}
      >{`${item.vehname} • ${item.vehno}`}</Text>
      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>From:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickupLocation}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>To:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.dropLocation}
          </Text>
        </View>
      </View>
      {item.tripdate && <Text style={styles.dateText}>{item.tripdate}</Text>}
    </TouchableOpacity>
  );
};

interface FilterButtonProps {
  label: string;
  onPress: () => void;
  active: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  onPress,
  active,
}) => (
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
const TripListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { ownerProfile } = useAuthStore();
  const inputRef = React.useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusId, setStatusId] = useState<number | null>(1);

  const {
    data: trips,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTripsByOwner(ownerProfile?.id, statusId, searchQuery);

  // 3. Create a debounced function to update the search query
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
    }, 500), // 500ms delay
    []
  );

  const handleSearchChange = (text: string) => {
    debouncedSearch(text);
  };

  const statusFilters = [
    { label: "Completed", id: 1 },
    { label: "In Progress", id: 2 },
    { label: "Cancelled", id: 3 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Rider or Vehicle..."
            placeholderTextColor={colors.gray[400]}
            onChangeText={handleSearchChange}
            // clear input on close icon press
            ref={inputRef}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                if (inputRef.current) {
                  inputRef.current.clear();
                }
              }}
              style={{ paddingRight: 8 }}
            >
              <SvgClose width={10} height={10} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <FilterIcon />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <FilterButton
              key={filter.label}
              label={filter.label}
              active={statusId === filter.id}
              onPress={() => setStatusId(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          size="large"
          color={colors.brand.primary}
        />
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Failed to load trips.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips || []}
          keyExtractor={(item) => item.tripNo}
          renderItem={({ item, index }) => (
            <TripCard
              item={item}
              index={index}
              onPress={() =>
                navigation.navigate("TripDetailsScreen", {
                  tripId: item.tripNo,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No trips found.</Text>
            </View>
          )}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "30%",
  },
  emptyText: {
    ...TYPOGRAPHY.header,
    fontSize: 18,
    color: colors.gray[600],
  },
  errorText: {
    ...TYPOGRAPHY.header,
    color: colors.status.error,
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

export default TripListScreen;
