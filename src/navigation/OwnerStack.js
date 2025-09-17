import { Text, StyleSheet } from "react-native"; // Import StyleSheet
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import OwnerListScreen from "../Screens/Owner/ownerListScreen";
// import OwnerSetupScreen from "../Screens/Owner/ownerSetupScreen";
// import OwnerDetailScreen from "../Screens/Owner/ownerDetailsScreen";
import { CustomHeader } from "../uikit/CustomDrawerHeader";
import { colors } from "../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../theme/typography";

const Stack = createStackNavigator();

export const OwnerNavigator = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        animation: "fade",
        header: ({ options }) => {
          const canGoBack = navigation.canGoBack();
          const title = options?.title || route.name;

          return (
            <CustomHeader
              title={title}
              canGoBack={canGoBack}
              onRightPress={options.onHeaderRightPress}
              rightIcon={options.headerRightIcon}
              onLeftPress={() => {
                if (canGoBack) {
                  navigation.goBack();
                } else {
                  navigation.getParent()?.openDrawer();
                }
              }}
            />
          );
        },
      })}
    >
      <Stack.Screen
        name="OwnerListScreen"
        options={{
          title: "All Owners",
          onHeaderRightPress: () => {
            navigation.navigate("OwnerSetupScreen");
          },
          headerRightIcon: <Text style={styles.headerActionText}>Add</Text>,
        }}
        component={OwnerListScreen}
      />
      {/* <Stack.Screen
        name="OwnerDetailsScreen"
        options={({ route }) => ({
          title: "Owner Details",
          onHeaderRightPress: () => {
            navigation.navigate("OwnerSetupScreen", {
              ownerId: route.params.ownerId,
            });
          },

          headerRightIcon: <Text style={styles.headerActionText}>Edit</Text>,
        })}
        component={OwnerDetailScreen}
      />
      <Stack.Screen
        name="OwnerSetupScreen"
        options={({ route }) => ({
          title: route.params?.ownerId ? "Edit Owner" : "Add Owner",
        })}
        component={OwnerSetupScreen}
      /> */}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerActionText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "600",
  },
});
