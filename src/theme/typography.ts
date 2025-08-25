import { StyleSheet } from "react-native";
import { colors } from "../uikit/UikitUtils/colors";
// import { colors } from "./colors"; // Your colors file

const FONT_FAMILY = {
  POPPINS_REGULAR: "Poppins-Regular",
  POPPINS_MEDIUM: "Poppins-Medium",
  POPPINS_BOLD: "Poppins-Bold",
};

export const TYPOGRAPHY = StyleSheet.create({
  header: {
    fontFamily: FONT_FAMILY.POPPINS_BOLD,
    fontSize: 22,
    color: colors.text.primary,
  },
  title: {
    fontFamily: FONT_FAMILY.POPPINS_MEDIUM,
    fontSize: 18,
    color: colors.text.primary,
  },
  body: {
    fontFamily: FONT_FAMILY.POPPINS_REGULAR,
    fontSize: 14,
    color: colors.gray[600],
  },
  label: {
    fontFamily: FONT_FAMILY.POPPINS_REGULAR,
    fontSize: 14,
    color: colors.gray[400],
  },
  caption: {
    fontFamily: FONT_FAMILY.POPPINS_MEDIUM,
    fontSize: 12,
    color: colors.gray[500],
  },
});
