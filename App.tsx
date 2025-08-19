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
  const { isAuthenticated } = useAuthStore();

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
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            // Process any queued notifications once navigation is ready
          }}
        >
          <NavigationRoot />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
