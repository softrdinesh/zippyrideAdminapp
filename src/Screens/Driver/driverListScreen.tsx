import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import { useActiveOwnerId } from "../../zustand/useAuthStore";
import { useGetDriversByOwnerID } from "../../services/api/driver";

const DriverCard = ({ item, onPress }) => {
  const statusStyle =
    item.driverStatus === "Active"
      ? styles.statusActive
      : styles.statusInactive;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{
          uri:
            item.riderpic ||
            `https://placehold.co/60x60/png?font=poppins&text=${item?.drivername[0].toUpperCase()}`,
        }}
        style={styles.avatar}
      />
      <View style={styles.cardDetails}>
        <Text style={styles.driverName}>{item.drivername}</Text>
        <Text
          style={styles.vehicleInfo}
        >{`${item.vehiclename} • ${item.vehicleno}`}</Text>
      </View>
      <View style={[styles.statusBadge, statusStyle.container]}>
        <Text style={[styles.statusText, statusStyle.text]}>
          {item.driverStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const DriverListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const activeOwnerId = useActiveOwnerId();

  const {
    data: drivers,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDriversByOwnerID(activeOwnerId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>Failed to load drivers.</Text>
        <Text style={styles.errorSubText}>Please try again later.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={drivers ?? []}
        keyExtractor={(item) => item.driverID.toString()}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            onPress={() =>
              navigation.navigate("DriverDetailsScreen", {
                driver: item,
              })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No drivers found.</Text>
            <Text style={styles.emptySubText}>
              Add your first driver to see them here.
            </Text>
          </View>
        )}
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
    flexGrow: 1, // Ensures empty component can center itself
    padding: 24,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: colors.gray[100],
  },
  cardDetails: {
    flex: 1,
  },
  driverName: {
    ...TYPOGRAPHY.title,
  },
  vehicleInfo: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "bold",
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
  },
  emptySubText: {
    ...TYPOGRAPHY.body,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    ...TYPOGRAPHY.header,
    color: colors.status.error,
  },
  errorSubText: {
    ...TYPOGRAPHY.body,
    color: colors.status.error,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[100],
  },
});

export default DriverListScreen;
