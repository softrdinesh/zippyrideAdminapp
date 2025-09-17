import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Svg, { Path } from "react-native-svg";

import { useAuthStore } from "../../zustand/useAuthStore";
import { TYPOGRAPHY } from "../../theme/typography";
import SvgDriver from "../../icons/SvgDriver";
import SvgCarIcon from "../../icons/SvgCarIcon";
import { colors } from "../UikitUtils/colors";
import PaymentMethod from "../../icons/SvgPaymentMethod";
import { firebase } from "@react-native-firebase/messaging";

const LogoutIcon = ({ color = colors.gray[600], size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
      fill={color}
    />
  </Svg>
);

export const CustomDrawerContent = (props) => {
  const { state, navigation } = props;
  const { routes, index } = state;
  const { userProfile, logoutUser } = useAuthStore();
  const focusedRoute = routes[index].name;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          await firebase.messaging().deleteToken();
          logoutUser();
        },
      },
    ]);
  };

  const renderDrawerItem = (routeName, label, IconComponent) => {
    const isFocused = focusedRoute === routeName;
    const color = isFocused ? colors.brand.primary : colors.gray[600];

    return (
      <TouchableOpacity
        style={[styles.drawerItem, isFocused && styles.drawerItemFocused]}
        onPress={() => navigation.navigate(routeName)}
      >
        <View style={styles.drawerItemIcon}>
          <IconComponent color={color} size={24} />
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
                uri:
                  userProfile?.profilepic ||
                  `https://placehold.co/60x60/png?font=poppins&text=${userProfile?.username[0].toUpperCase()}`,
              }}
              style={styles.avatar}
            />
            <Text style={styles.title}>{userProfile?.username || ""}</Text>
            {userProfile?.mobileno && (
              <Text style={styles.caption}>{userProfile?.mobileno}</Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* List of Options */}
          {renderDrawerItem("VehicleSetup", "Vehicle Setup", SvgCarIcon)}
          {renderDrawerItem("TripDetails", "Trip Details", SvgDriver)}
          {renderDrawerItem("TrackYourDriver", "Track your driver", SvgDriver)}
          {renderDrawerItem("PaymentScreen", "Payment", PaymentMethod)}
        </View>
      </DrawerContentScrollView>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
          <View style={styles.drawerItemIcon}>
            <LogoutIcon />
          </View>
          <Text style={[styles.drawerItemLabel, { color: colors.gray[600] }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    backgroundColor: colors.brand.primary + "1A",
  },
  drawerItemIcon: {
    marginRight: 20, // Increased space for a cleaner look
  },
  drawerItemLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: "500",
  },
  logoutSection: {
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
});
