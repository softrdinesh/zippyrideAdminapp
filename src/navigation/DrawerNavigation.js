import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import ProfileScreen from "../Screens/Profile/profileScreen";
import { VehicleNavigator } from "./VehicleStack";
import { CustomDrawerContent } from "../uikit/CustomDrawerContent";
import { TripsNavigator } from "./TripsStack";
import { DriverNavigator } from "./DriverStack";

const Drawer = createDrawerNavigator();

export const MainDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="VehicleSetup" component={VehicleNavigator} />
      <Drawer.Screen name="TripDetails" component={TripsNavigator} />
      <Drawer.Screen name="TrackYourDriver" component={DriverNavigator} />
    </Drawer.Navigator>
  );
};
