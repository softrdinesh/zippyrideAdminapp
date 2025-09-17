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

const OwnerCard = ({ item, onPress }: { item: Owner; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{
        uri:
          item.profilepic ||
          `https://placehold.co/100x100/png?font=poppins&text=${item.username.charAt(
            0
          )}`,
      }}
      style={styles.avatar}
    />
    <View style={styles.cardDetails}>
      <Text style={styles.ownerName}>{item.username}</Text>
      <Text style={styles.companyName}>{item.companyname}</Text>
    </View>
    {/* Arrow icon indicates it's tappable */}
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);

// --- Main Screen Component ---
const OwnerListScreen = ({ navigation }) => {
  // 2. Fetch data using the hook (commented out to use mock data for now)
  // const { data: owners, isLoading, isError, refetch } = useGetAllOwners();

  // Using detailed mock data for UI development
  const owners = [
    {
      ownerID: 1,
      username: "Kevin Macwan",
      companyname: "ZippyRide Solutions",
      profilepic: null,
    },
    {
      ownerID: 2,
      username: "Priya Sharma",
      companyname: "Sharma Transport",
      profilepic: "https://placehold.co/100x100/png?font=poppins&text=PS",
    },
    {
      ownerID: 3,
      username: "Amit Patel",
      companyname: "Patel Logistics",
      profilepic: null,
    },
  ];
  const isLoading = false;
  const isError = false;

  // This ensures the list is refreshed every time the screen is focused
  // useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  // 3. Add a header right button to navigate to the create screen
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("OwnerSetupScreen")}
        >
          <Text style={styles.headerButtonText}>Add New</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 4. Handle Loading State
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
