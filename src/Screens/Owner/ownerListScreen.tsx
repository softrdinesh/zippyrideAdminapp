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
import { useGetAllOwners, Owner } from "../../services/api/admin-owner";
import { useAuthStore } from "../../zustand/useAuthStore";

const OwnerCard = ({ item, onPress }: { item: Owner; onPress: () => void }) => {
  const statusStyle =
    item.status === "Active" ? styles.statusActive : styles.statusInactive;

  return (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{
        uri:
          item.profilepic ||
          `https://placehold.co/100x100/png?font=poppins&text=${item.ownerUsername
            .charAt(0)
            .toUpperCase()}`,
      }}
      style={styles.avatar}
    />
    <View style={styles.cardDetails}>
      <Text style={styles.ownerName}>{item.ownerUsername}</Text>
      <Text style={styles.companyName}>{item.companyname}</Text>

        <View style={[styles.statusBadge, statusStyle.container]}>
          <Text style={[styles.statusText, statusStyle.text]}>
            {item.status}
          </Text>
        </View>
    </View>
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);
};

const OwnerListScreen = ({}) => {
  const navigation = useNavigation();
  const { userProfile } = useAuthStore();

  const {
    data: owners,
    isLoading,
    isError,
    refetch,
  } = useGetAllOwners(userProfile);

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

  // 5. Handle Error State
  if (isError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>Failed to load owners.</Text>
        <Text style={styles.errorSubText}>
          Please check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={owners}
        keyExtractor={(item) => item.ownerID.toString()}
        renderItem={({ item }) => (
          <OwnerCard
            item={item}
            onPress={() =>
              navigation.navigate("OwnerDetailsScreen", { owner: item })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Owners Found</Text>
            <Text style={styles.emptySubText}>
              Tap "Add New" to create the first owner.
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
    padding: 24,
    flexGrow: 1,
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
    backgroundColor: colors.gray[200],
  },
  cardDetails: {
    flex: 1,
  },
  ownerName: {
    ...TYPOGRAPHY.title,
  },
  companyName: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 24,
    color: colors.gray[300],
  },
  headerButtonText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "600",
    marginRight: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[100],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  },
  errorText: {
    ...TYPOGRAPHY.header,
    color: colors.status.error,
  },
  errorSubText: {
    ...TYPOGRAPHY.body,
    color: colors.gray[500],
    marginTop: 8,
    textAlign: "center",
  },
});

export default OwnerListScreen;
