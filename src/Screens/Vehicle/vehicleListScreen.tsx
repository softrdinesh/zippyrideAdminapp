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
import { useGetVehiclesByOwnerId } from "../../services/api";
import { useAuthStore } from "../../zustand/useAuthStore";
import SvgCarIcon from "../../icons/SvgCarIcon";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Loader from "../../uikit/Loader/Loader";

// Reusable component for each vehicle card in the list
const VehicleCard = ({ vehicle, onPress }) => {
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
            <SvgCarIcon size={50} color="#4267B2" />
          )}
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardVehName}>{vehicle.vehName}</Text>
          <Text style={styles.cardVehNo}>{vehicle.vehno}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{vehicle.vehicleTypeInfo}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main component for the Vehicle List Screen
const VehicleListScreen = () => {
  const { ownerProfile } = useAuthStore();
  const navigation = useNavigation();

  const {
    data: vehicles,
    refetch,
    isFetching: isLoadingVehicles,
  } = useGetVehiclesByOwnerId(ownerProfile?.id);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No vehicles added yet.</Text>
      <Text style={styles.emptySubText}>
        Tap the '+' button to add your first vehicle.
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
    backgroundColor: "#F8F9FA", // A slightly off-white for better contrast
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  itemCard: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  listDivider: {
    height: 16, // Creates space between cards
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E9ECEF",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "System",
  },
  cardVehNo: {
    fontSize: 14,
    color: "#868E96",
    marginTop: 4,
    fontFamily: "System",
  },
  chip: {
    backgroundColor: "#F1F3F5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    alignSelf: "flex-start", // Ensures chip is only as wide as its content
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#495057",
    fontFamily: "System",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "40%", // Push content down a bit
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    fontFamily: "System",
  },
  emptySubText: {
    fontSize: 14,
    color: "#ADB5BD",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
    fontFamily: "System",
  },
});

export default VehicleListScreen;
