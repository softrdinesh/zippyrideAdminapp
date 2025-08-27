import { Text, StyleSheet } from "react-native"; // Import StyleSheet
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { CustomHeader } from "../uikit/CustomDrawerHeader";
import { colors } from "../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../theme/typography";
import TripListScreen from "../Screens/Trips/tripListScreen";

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
