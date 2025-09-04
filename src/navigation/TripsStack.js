import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { CustomHeader } from "../uikit/CustomDrawerHeader";
import TripListScreen from "../Screens/Trips/tripListScreen";
import TripDetailsScreen from "../Screens/Trips/tripDetailsScreen";

const Stack = createStackNavigator();

export const TripsNavigator = () => {
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
        name="TripListScreen"
        component={TripListScreen}
        options={{
          title: "All Trips",
        }}
      />
      <Stack.Screen
        name="TripDetailsScreen"
        component={TripDetailsScreen}
        options={{
          title: "Trip Details",
        }}
      />
    </Stack.Navigator>
  );
};
