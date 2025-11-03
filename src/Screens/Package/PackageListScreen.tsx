import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useActiveOwnerId } from "../../zustand/useAuthStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Loader from "../../uikit/Loader/Loader";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { config } from "../../services/config";
// Define the PackageListItem type based on the API response
interface PackageListItem {
  packageID: number;
  packagename: string;
  fromcity: string;
  tocity: string;
  isOneway: boolean;
  isTwoWay: boolean;
  ownerID: number;
  onewayprice: number;
  twowayprice: number;
  createDate: string;
  lastmodifiedDate: string;
  ownername: string;
  ownercompanyname: string;
}

// Professional Route Icon Component
const RouteIcon = ({ size = 50, color = colors.brand.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 16L5 19M16 16L19 19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Edit Icon Component
const EditIcon = ({ size = 20, color = colors.brand.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// API hook using axios
const useGetPackagesByOwnerId = (ownerId: number) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['packages', ownerId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.BASE_URL}GetPackagelistbyOwner?OwnerID=${ownerId}`
      );
      return response.data as PackageListItem[];
    },
    enabled: !!ownerId,
  });

  return {
    data: data || [],
    isLoading,
    isFetching,
    refetch,
  };
};

// Reusable component for each package card in the list
const PackageCard = ({
  package: pkg,
  onPress,
  onEdit,
}: {
  package: PackageListItem;
  onPress: () => void;
  onEdit: () => void;
}) => {
  const packageType = pkg.isTwoWay ? "Two Way" : "One Way";
  const price = pkg.isTwoWay ? pkg.twowayprice : pkg.onewayprice;

  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.cardImageContainer}>
          <RouteIcon size={50} color={colors.brand.primary} />
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.headerRow}>
            <Text style={styles.cardVehName}>{pkg.packagename}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card press when editing
                onEdit();
              }}
            >
              <EditIcon size={18} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardVehNo}>
            {pkg.fromcity} → {pkg.tocity}
          </Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{packageType}</Text>
          </View>
          <Text style={styles.priceText}>₹{price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main component for the Package List Screen
const PackageListScreen = () => {
  const activeOwnerId = useActiveOwnerId();
  const navigation = useNavigation();

  const {
    data: packages,
    refetch,
    isFetching: isLoadingPackages,
  } = useGetPackagesByOwnerId(activeOwnerId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const handleEditPackage = (packageId: number, packageData: PackageListItem) => {
    console.log("Edit package:", packageId);
    // Navigate to edit screen with package data
    navigation.navigate("EditPackageScreen", {
      packageId: packageId,
      packageData: packageData,
    });
  };

  const handleViewPackage = (packageId: number) => {
    console.log("View package:", packageId);
    navigation.navigate("PackageDetailsScreen", {
      packageId: packageId,
    });
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <RouteIcon size={80} color={colors.gray[400]} />
      <Text style={styles.emptyText}>No Trip Packages added yet.</Text>
      <Text style={styles.emptySubText}>
        Tap the 'Add' button to add your first package.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Package List */}
      {isLoadingPackages && <Loader />}
      <FlatList
        data={packages}
        keyExtractor={(item) => item.packageID.toString()}
        renderItem={({ item }) => (
          <PackageCard
            package={item}
            onPress={() => handleViewPackage(item.packageID)}
            onEdit={() => handleEditPackage(item.packageID, item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.listDivider} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  itemCard: {
    borderRadius: 12,
    backgroundColor: colors.base.white,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  listDivider: {
    height: 16,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  cardDetails: {
    marginLeft: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardVehName: {
    ...TYPOGRAPHY.title,
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.brand.primary + "10",
  },
  cardVehNo: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginBottom: 4,
  },
  chip: {
    backgroundColor: colors.brand.primary + "20",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: colors.brand.primary,
  },
  priceText: {
    ...TYPOGRAPHY.title,
    color: colors.brand.primary,
    marginTop: 4,
    fontWeight: "600",
  },
  statusActive: {
    container: { backgroundColor: colors.status.success + "20" },
    text: { color: colors.status.success },
  },
  statusInactive: {
    container: { backgroundColor: colors.status.error + "20" },
    text: { color: colors.status.error },
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    ...TYPOGRAPHY.header,
    fontSize: 18,
    color: colors.gray[600],
    textAlign: "center",
    marginTop: 16,
  },
  emptySubText: {
    ...TYPOGRAPHY.body,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
    color: colors.gray[500],
  },
});

export default PackageListScreen;