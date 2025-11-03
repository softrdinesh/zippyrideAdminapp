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
import { useGetVehiclesByOwnerId, VehicleListItem } from "../../services/api";
import { useActiveOwnerId,useAuthStore } from "../../zustand/useAuthStore";
import SvgCarIcon from "../../icons/SvgCarIcon";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Loader from "../../uikit/Loader/Loader";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";

// Reusable component for each vehicle card in the list
const VehicleCard = ({
  vehicle,
  onPress,
}: {
  vehicle: VehicleListItem;
  onPress: () => void;
}) => {
  const isOwnerView = vehicle.vehicleTypeInfo !== undefined;

  const statusText = isOwnerView ? vehicle.vehicleTypeInfo : vehicle.status;

  const statusStyle =
    vehicle.status === "Active" ? styles.statusActive : styles.statusInactive;

  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.cardImageContainer}>
          {vehicle.vehiclePicture ? (
            <Image
              source={{ uri: vehicle.vehiclePicture }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <SvgCarIcon size={50} color={colors.brand.primary} />
          )}
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardVehName}>{vehicle.vehName}</Text>
          <Text style={styles.cardVehNo}>{vehicle.vehno}</Text>
          <View style={[styles.chip, !isOwnerView && statusStyle.container]}>
            <Text style={[styles.chipText, !isOwnerView && statusStyle.text]}>
              {statusText}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main component for the Vehicle List Screen
const VehicleListScreen = () => {
  const activeOwnerId = useActiveOwnerId();
  const navigation = useNavigation();
  const { userProfile,  } = useAuthStore();
console.log(userProfile,'userProfile')
  const {
    data: vehicles,
    refetch,
    isFetching: isLoadingVehicles,
  } = useGetVehiclesByOwnerId(activeOwnerId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No vehicles added yet.</Text>
      <Text style={styles.emptySubText}>
        Tap the 'Add' button to add your first vehicle.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Vehicle List */}
      {isLoadingVehicles && <Loader />}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.vehID}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => {
              console.log("View vehicle:", item);
              navigation.navigate("VehicleDetailsScreen", {
                vehicleId: item.vehID,
              });
            }}
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
  cardVehName: {
    ...TYPOGRAPHY.title,
    color: colors.text.primary,
  },
  cardVehNo: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
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
  },
  emptyText: {
    ...TYPOGRAPHY.header,
    fontSize: 18,
    color: colors.gray[600],
    textAlign: "center",
  },
  emptySubText: {
    ...TYPOGRAPHY.body,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default VehicleListScreen;
