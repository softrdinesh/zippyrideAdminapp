import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import NetworkLogger from "react-native-network-logger";
import { useDebugStore } from "../../zustand/useDebugStore";
import { TYPOGRAPHY } from "../../theme/typography";
import { colors } from "../UikitUtils/colors";

const DebugNetworkLogger: React.FC = () => {
  const { isLoggerVisible, toggleLogger } = useDebugStore();

  return (
    <Modal
      visible={isLoggerVisible}
      onRequestClose={toggleLogger}
      animationType="slide"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Network Log</Text>
          <TouchableOpacity onPress={toggleLogger} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <NetworkLogger />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base.white,
  },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    ...TYPOGRAPHY.title,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "600",
  },
});

export default DebugNetworkLogger;
