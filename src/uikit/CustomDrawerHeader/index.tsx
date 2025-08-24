import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// --- Reusable SVG Icons ---
const MenuIcon = ({ color = "#212529", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill={color} />
  </Svg>
);

const BackArrowIcon = ({ color = "#212529", size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      fill={color}
    />
  </Svg>
);

export const CustomHeader = ({
  title,
  canGoBack,
  onLeftPress,
  onRightPress,
  rightIcon,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerButton} onPress={onLeftPress}>
          {canGoBack ? <BackArrowIcon /> : <MenuIcon />}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={onRightPress}
          disabled={!onRightPress}
        >
          {rightIcon}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212529",
    fontFamily: "System",
  },
});
