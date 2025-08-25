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
import { TYPOGRAPHY } from "../theme/typography";
import SvgCarIcon from "../icons/SvgCarIcon";
import SvgDriver from "../icons/SvgDriver";

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

  // Helper function to create drawer items
  const renderDrawerItem = (routeName, label) => {
    const isFocused = focusedRoute === routeName;
    const Icon = routeName === "TrackYourDriver" ? SvgDriver : SvgCarIcon; // Use the sample icon for now
    const color = isFocused ? colors.brand.primary : colors.gray[600];

    return (
      <TouchableOpacity
        style={[styles.drawerItem, isFocused && styles.drawerItemFocused]}
        onPress={() => navigation.navigate(routeName)}
      >
        <View style={styles.drawerItemIcon}>
          <Icon color={color} size={24} />
        </View>
        <Text style={[styles.drawerItemLabel, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          {/* User Details Section */}
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* List of Options */}
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
  container: {
    flex: 1,
    backgroundColor: colors.base.white,
  },
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[100],
  },
  title: {
    ...TYPOGRAPHY.title,
    marginTop: 15,
  },
  caption: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
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
    backgroundColor: colors.brand.primary + "1A", // Primary color with ~10% opacity
  },
  drawerItemIcon: {
    marginRight: 10,
  },
  drawerItemLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: "500", // Make labels slightly bolder
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.header,
    fontSize: 20, // Override for header
  },
});
