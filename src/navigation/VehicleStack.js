import { Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import VehicleSetupScreen from "../Screens/Vehicle/vehicleSetupScreen";
import VehicleListScreen from "../Screens/Vehicle/vehicleListScreen";
import VehicleDetailScreen from "../Screens/Vehicle/vehicleDetailsScreen";
import { CustomHeader } from "../uikit/CustomDrawerHeader";

const Stack = createStackNavigator();

export const VehicleNavigator = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        animation: "fade",
        header: ({ options }) => {
          console.log("VehicleNavigator route:", options);
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
          headerRightIcon: (
            <Text
              style={{
                fontSize: 16,
                color: "#F84A01",
                fontWeight: "600",
              }}
            >
              Add
            </Text>
          ),
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
          headerRightIcon: (
            <Text
              style={{
                fontSize: 16,
                color: "#F84A01",
                fontWeight: "600",
              }}
            >
              Edit
            </Text>
          ),
        })}
        component={VehicleDetailScreen}
      />
      <Stack.Screen
        name="VehicleSetupScreen"
        options={{
          title: "Add Vehicle",
        }}
        component={VehicleSetupScreen}
      />
    </Stack.Navigator>
  );
};
