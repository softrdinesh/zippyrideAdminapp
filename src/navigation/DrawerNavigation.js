import React from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import Svg, { Path } from "react-native-svg";

import ProfileScreen from "../Screens/Profile/profileScreen";
import { colors } from "../uikit/UikitUtils/colors";
import { useAuthStore } from "../zustand/useAuthStore";
import { VehicleNavigator } from "./VehicleStack";

const Drawer = createDrawerNavigator();

// 1. A sample SVG icon component to be used for all items
const SampleSvgIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
      fill={color}
    />
  </Svg>
);

// This is the custom component for the drawer's content
const CustomDrawerContent = (props) => {
  const { state, navigation } = props;
  const { routes, index } = state;
  const { ownerProfile } = useAuthStore();
  const focusedRoute = routes[index].name;

  // Helper function to create drawer items to avoid repetition
  const renderDrawerItem = (routeName, label, iconName) => {
    const isFocused = focusedRoute === routeName;
    const color = isFocused ? colors.brand.primary : colors.gray[500]; // Active vs. inactive color
    const Icon = SampleSvgIcon; // Use the sample icon for now
    return (
      <TouchableOpacity
        style={[styles.drawerItem, isFocused && styles.drawerItemFocused]}
        onPress={() => navigation.navigate(routeName)}
      >
        {/* <View style={styles.drawerItemIcon}>
          <Icon color={color} size={24} />
        </View> */}
        <Text style={[styles.drawerItemLabel, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          {/* 2. User Details Section using standard components */}
          <View style={styles.userInfoSection}>
            <Image
              source={{
                uri: "https://placehold.co/80x80/E0E0E0/333?text=JD",
              }}
              style={styles.avatar}
            />
            <Text style={styles.title}>John Doe</Text>
            <Text style={styles.caption}>john.doe@example.com</Text>
          </View>

          {/* 3. Divider using a standard View */}
          <View style={styles.divider} />

          {/* 4. List of Options with the sample SVG icon */}
          {renderDrawerItem("VehicleSetup", "Vehicle Setup")}
          {renderDrawerItem("TripDetails", "Trip Details")}
          {renderDrawerItem("TrackYourDriver", "Track your driver")}
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

// This is your main drawer navigator
export const MainDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="VehicleSetup"
        options={{
          headerShown: false,
        }}
        component={VehicleNavigator}
      />
      <Drawer.Screen
        name="TripDetails"
        options={{
          headerTitle: "Trip Details",
        }}
        component={ProfileScreen}
      />
      <Drawer.Screen
        name="TrackYourDriver"
        options={{
          headerTitle: "Track your driver",
        }}
        component={ProfileScreen}
      />
    </Drawer.Navigator>
  );
};

// Styles for the custom drawer component
const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[200],
  },
  title: {
    fontSize: 18,
    marginTop: 15,
    fontWeight: "bold",
    color: "#333",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
    marginHorizontal: 20,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  drawerItemFocused: {
    backgroundColor: "rgba(244, 81, 30, 0.1)",
  },
  drawerItemIcon: {
    marginRight: 20,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});
