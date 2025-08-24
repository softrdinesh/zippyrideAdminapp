import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthNavigator } from "./src/navigation/AuthNavigator";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./src/zustand/useAuthStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import VehicleSetup from "./src/Screens/Vehicle/vehicleSetupScreen";
import Toast from "react-native-toast-message";
import { MainDrawer } from "./src/navigation/DrawerNavigation";

enableScreens();

const Stack = createStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const NavigationRoot = () => {
  const { isAuthenticated, isVehicleTag } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {!isAuthenticated ? (
        // Auth screens
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isVehicleTag ? (
        <Stack.Screen
          name="VehicleSetup"
          component={VehicleSetup}
          options={{
            headerShown: true,
            headerTitleAlign: "center",
            headerTitle: "Add Vehicle",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "600",
              color: "#212529",
              fontFamily: "System",
            },
          }}
        />
      ) : (
        // Protected screens
        <>
          <Stack.Screen name="Main" component={MainDrawer} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  const navigationRef = useRef();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              // Process any queued notifications once navigation is ready
            }}
          >
            <NavigationRoot />
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
