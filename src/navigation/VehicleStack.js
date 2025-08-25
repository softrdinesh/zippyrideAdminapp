import { Text, StyleSheet } from "react-native"; // Import StyleSheet
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import VehicleSetupScreen from "../Screens/Vehicle/vehicleSetupScreen";
import VehicleListScreen from "../Screens/Vehicle/vehicleListScreen";
import VehicleDetailScreen from "../Screens/Vehicle/vehicleDetailsScreen";
import { CustomHeader } from "../uikit/CustomDrawerHeader";
import { colors } from "../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../theme/typography";

const Stack = createStackNavigator();

export const VehicleNavigator = () => {
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
        name="VehicleListScreen"
        options={{
          title: "All Vehicles",
          onHeaderRightPress: () => {
            navigation.navigate("VehicleSetupScreen");
          },
          headerRightIcon: <Text style={styles.headerActionText}>Add</Text>,
        }}
        component={VehicleListScreen}
      />
      <Stack.Screen
        name="VehicleDetailsScreen"
        options={({ route }) => ({
          title: "Vehicle Details",
          onHeaderRightPress: () => {
            navigation.navigate("VehicleSetupScreen", {
              vehicleId: route.params.vehicleId,
            });
          },

          headerRightIcon: <Text style={styles.headerActionText}>Edit</Text>,
        })}
        component={VehicleDetailScreen}
      />
      <Stack.Screen
        name="VehicleSetupScreen"
        options={({ route }) => ({
          title: route.params?.vehicleId ? "Edit Vehicle" : "Add Vehicle",
        })}
        component={VehicleSetupScreen}
      />
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
