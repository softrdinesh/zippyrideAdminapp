import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import {
  Owner,
  useResetOwnerPassword,
  useToggleOwnerStatus,
} from "../../services/api/admin-owner";
import { TelegramIcon } from "../../icons/SvgTelegramIcon";
import { PhoneIcon } from "../../icons/SvgPhoneIcon";
import { KeyIcon } from "../../icons/SvgKeyIcon";
import { AddressIcon } from "../../icons/SvgAddressIcon";
import { useAuthStore } from "../../zustand/useAuthStore";

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const DetailRowWithIcon = ({
  Icon,
  label,
  value,
}: {
  Icon: JSX.Element;
  label: string;
  value?: string | null;
}) => (
  <View style={styles.detailRow}>
    <View style={styles.iconWrapper}>{Icon}</View>
    <View style={styles.textWrapper}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "N/A"}</Text>
    </View>
  </View>
);

// --- Main Screen Component ---
const OwnerDetailsScreen: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  // The full owner object is passed from the list screen
  const { owner }: { owner: Owner } = route.params;

  const [isActive, setIsActive] = useState(owner.status === "Active");

  const ownerDetails = {
    ownerID: owner?.ownerID || 1,
    username: owner?.ownerUsername || "",
    companyname: owner?.companyname || "",
    mobileno: owner?.mobileno || "",
    whatsappno: owner?.whatsappno || "",
    address: owner?.address || "",
    countryName: "",
    locationName: "",
    telegarmid: "",
    profilepic:
      owner?.profilepic ||
      `https://placehold.co/200x200/png?font=poppins&text=${owner?.ownerUsername[0].toUpperCase()}`,
  };

  const resetPasswordMutation = useResetOwnerPassword();
  const toggleStatusMutation = useToggleOwnerStatus();

  const navigateToOwnerModule = (screenName: string) => {
    setManagedOwner(owner);
    navigation.navigate(screenName);
  };

  const handleToggleStatus = (newValue: boolean) => {
    const action = newValue ? "enable" : "disable";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Owner`,
      `Are you sure you want to ${action} ${owner.ownerUsername}?`,
      [
        { text: "Cancel", style: "cancel", onPress: () => {} },
        {
          text: `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          style: "destructive",
          onPress: async () => {
            setIsActive(newValue);
            try {
              await toggleStatusMutation.mutateAsync({
                ownerID: owner.ownerID,
                isEnable: newValue,
              });
              Toast.show({
                type: "success",
                text1: "Success",
                text2: `Owner has been ${action}d.`,
              });
            } catch (e) {
              setIsActive(!newValue);
              console.error("Failed to toggle owner status:", e);
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = () => {
    Alert.alert(
      "Reset Password",
      `Are you sure you want to reset the password for ${ownerDetails.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetPasswordMutation.mutateAsync({
                ownerID: owner.ownerID,
              });
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Password has been reset.",
              });
            } catch (e) {
              console.error("Password reset failed:", e);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Main Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: ownerDetails.profilepic }}
            style={styles.avatar}
          />
          <Text style={styles.ownerName}>{ownerDetails.username}</Text>
          <Text style={styles.companyName}>{ownerDetails.companyname}</Text>
        </View>

        {/* Contact Info Card */}
        <InfoCard title="Contact Information">
          <DetailRowWithIcon
            Icon={<PhoneIcon />}
            label="Mobile"
            value={ownerDetails.mobileno}
          />
          <DetailRowWithIcon
            Icon={<PhoneIcon color={colors.status.success} />}
            label="WhatsApp"
            value={ownerDetails.whatsappno}
          />
          <DetailRowWithIcon
            Icon={<TelegramIcon />}
            label="Telegram"
            value={ownerDetails.telegarmid}
          />
          <DetailRowWithIcon
            Icon={<AddressIcon />}
            label="Address"
            value={ownerDetails.address}
          />
        </InfoCard>

        {/* Location Info Card */}
        <InfoCard title="Location">
          <DetailRowWithIcon
            Icon={<AddressIcon />}
            label="Country"
            value={ownerDetails.countryName}
          />
          <DetailRowWithIcon
            Icon={<AddressIcon />}
            label="City / Location"
            value={ownerDetails.locationName}
          />
        </InfoCard>

        {/* Account Actions Card */}
        <InfoCard title="Account Actions">
          <View style={styles.actionRow}>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionButtonText}>Owner Status</Text>
              <Text style={styles.actionSubText}>
                {isActive ? "Active" : "Inactive"}
              </Text>
            </View>
            {toggleStatusMutation.isPending ? (
              <ActivityIndicator color={colors.brand.primary} />
            ) : (
              <Switch
                trackColor={{
                  false: colors.gray[200],
                  true: colors.status.success + "40",
                }}
                thumbColor={isActive ? colors.status.success : colors.gray[300]}
                ios_backgroundColor={colors.gray[200]}
                onValueChange={handleToggleStatus}
                value={isActive}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.actionButton]}
            onPress={handleResetPassword}
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? (
              <ActivityIndicator color={colors.brand.primary} />
            ) : (
              <>
                <KeyIcon />
                <Text style={styles.actionButtonText}>Reset Password</Text>
              </>
            )}
          </TouchableOpacity>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[100],
    borderWidth: 3,
    borderColor: colors.base.white,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ownerName: {
    ...TYPOGRAPHY.header,
    marginTop: 16,
  },
  companyName: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  iconWrapper: {
    width: 30,
    alignItems: "center",
    marginTop: 2,
  },
  textWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: colors.gray[400],
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginTop: 12,
  },
  actionButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: "500",
    marginLeft: 12,
    color: colors.gray[600],
  },
  resetButton: {
    backgroundColor: colors.status.error + "1A", // Error color with opacity
  },
  resetButtonText: {
    color: colors.status.error,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionSubText: {
    ...TYPOGRAPHY.caption,
    color: colors.gray[400],
    marginLeft: 12,
    marginTop: 2,
  },
});

export default OwnerDetailsScreen;
