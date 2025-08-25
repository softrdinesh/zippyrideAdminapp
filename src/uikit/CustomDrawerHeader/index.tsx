import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";

// --- Reusable SVG Icons (Updated with theme colors) ---
const MenuIcon = ({ color = colors.text.primary, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill={color} />
  </Svg>
);

const BackArrowIcon = ({ color = colors.text.primary, size = 24 }) => (
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onRightPress}
          disabled={!onRightPress}
        >
          {rightIcon ? rightIcon : <View />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 3. Styles updated to use TYPOGRAPHY and colors
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.base.white,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...TYPOGRAPHY.title,
    flex: 1, // Allows text to shrink if needed
    textAlign: "center",
    marginHorizontal: 8, // Add some space around the title
  },
});
