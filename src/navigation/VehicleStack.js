import { createStackNavigator } from "@react-navigation/stack";

import VehicleSetupScreen from "../Screens/Vehicle/vehicleSetupScreen";
import VehicleListScreen from "../Screens/Vehicle/vehicleListScreen";
import VehicleDetailScreen from "../Screens/Vehicle/vehicleDetailsScreen";
import { CustomHeader } from "../uikit/CustomDrawerHeader";

const Stack = createStackNavigator();

export const VehicleNavigator = () => {
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
        options={{ title: "All Vehicles" }} // Pass title via options
        component={VehicleListScreen}
      />
      <Stack.Screen
        name="VehicleDetailsScreen"
        options={{ title: "Vehicle Details" }} // Pass title via options
        component={VehicleDetailScreen}
      />
      <Stack.Screen
        name="VehicleSetupScreen"
        options={{
          headerShown: false,
        }}
        component={VehicleSetupScreen}
      />
    </Stack.Navigator>
  );
};
