import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { CustomHeader } from "../uikit/CustomDrawerHeader";
import ComplaintListScreen from "../Screens/Complaint/complaintListScreen";
import ComplaintDetailsScreen from "../Screens/Complaint/complaintDetailsScreen";

const Stack = createStackNavigator();

export const ComplaintNavigator = () => {
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
        name="ComplaintListScreen"
        component={ComplaintListScreen}
        options={{
          title: "All Complaint",
        }}
      />
      <Stack.Screen
        name="ComplaintDetails"
        component={ComplaintDetailsScreen}
        options={{ title: "Complaint Details" }}
      />
    </Stack.Navigator>
  );
};
