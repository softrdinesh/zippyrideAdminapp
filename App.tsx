import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import BottomTabs from "./src/navigation/Bottomtabs";

import Navbar from "./src/Screens/Navbar/Navbar";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./src/zustand/useAuthStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import VehicleSetup from "./src/Screens/Vehicle/vehicleSetupScreen";
import Toast from "react-native-toast-message";

enableScreens();

const Stack = createNativeStackNavigator();

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
        <Stack.Screen name="VehicleSetup" component={VehicleSetup} />
      ) : (
        // Protected screens
        <>
          <Stack.Screen
            name="Main"
            component={BottomTabs}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Navbar" component={Navbar} />
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
