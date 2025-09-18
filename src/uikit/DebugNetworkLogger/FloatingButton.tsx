import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

import { useDebugStore } from "../../zustand/useDebugStore";
import { colors } from "../UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";

const DebugTriggerButton: React.FC = () => {
  const { toggleLogger } = useDebugStore();

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={toggleLogger}>
      <Text style={styles.buttonText}>LOGS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    fontSize: 12,
    color: colors.base.white,
  },
});

export default DebugTriggerButton;
