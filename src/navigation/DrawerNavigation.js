import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ProfileScreen from "../Screens/Profile/profileScreen";
import { VehicleNavigator } from "./VehicleStack";
import { CustomDrawerContent } from "../uikit/CustomDrawerContent";

const Drawer = createDrawerNavigator();

export const MainDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="VehicleSetup"
        component={VehicleNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="TripDetails"
        component={ProfileScreen}
        options={{
          headerTitle: "Trip Details",
        }}
      />
      <Drawer.Screen
        name="TrackYourDriver"
        component={ProfileScreen}
        options={{
          headerTitle: "Track your driver",
        }}
      />
    </Drawer.Navigator>
  );
};
