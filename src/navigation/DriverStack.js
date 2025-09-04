import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { CustomHeader } from "../uikit/CustomDrawerHeader";

import DriverSetupScreen from "../Screens/Driver/driverSetupScreen";
import DriverListScreen from "../Screens/Driver/driverListScreen";

import { colors } from "../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../theme/typography";
import { StyleSheet, Text } from "react-native";

const Stack = createStackNavigator();

export const DriverNavigator = () => {
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
        name="DriverListScreen"
        component={DriverListScreen}
        options={{
          title: "All Drivers",
          onHeaderRightPress: () => {
            navigation.navigate("DriverSetupScreen");
          },
          headerRightIcon: <Text style={styles.headerActionText}>Add</Text>,
        }}
      />
      <Stack.Screen
        name="DriverSetupScreen"
        component={DriverSetupScreen}
        options={{
          title: "Add Driver",
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
