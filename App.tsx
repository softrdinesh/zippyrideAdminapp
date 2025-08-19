import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import { store } from "./src/Reudx/slices/store";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import BottomTabs from "./Bottomtabs";
import Common from "./src/Screens/Common/Common";
import Navbar from "./src/Screens/Navbar/Navbar";
import { RootState } from "./src/Reudx/slices/store";

enableScreens();

const Stack = createNativeStackNavigator();

const NavigationRoot = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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
          <Stack.Screen name="Common" component={Common} />
          <Stack.Screen name="Navbar" component={Navbar} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  const navigationRef = useRef();

  return (
    <Provider store={store}>
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
    </Provider>
  );
}
