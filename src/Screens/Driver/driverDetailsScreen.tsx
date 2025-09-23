import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import {
  DriverDetails,
  useResetDriverPassword,
} from "../../services/api/driver";
import PaymentMethod from "../../icons/SvgPaymentMethod";
import Toast from "react-native-toast-message";
import { TelegramIcon } from "../../icons/SvgTelegramIcon";
import { PhoneIcon } from "../../icons/SvgPhoneIcon";
import { AddressIcon } from "../../icons/SvgAddressIcon";
import { LicenseIcon } from "../../icons/SvgLocationIcon";
import { KeyIcon } from "../../icons/SvgKeyIcon";
import { ClockIcon } from "../../icons/SvgClockIcon";
import { StarIcon } from "../../icons/SvgRating";
import { UserIcon } from "../../icons/UserIcon";

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

const Rating = ({ rating }: { rating: number | null }) => {
  const totalStars = 5;
  const filledStars = Math.round(rating || 0);
  return (
    <View style={styles.ratingContainer}>
      {Array.from({ length: totalStars }).map((_, index) => (
        <StarIcon key={index} filled={index < filledStars} />
      ))}
      <Text style={styles.ratingText}>
        {rating ? rating.toFixed(1) : "No Rating"}
      </Text>
    </View>
  );
};

const DriverDetailsScreen: React.FC = ({ route }: any) => {
  const { driver }: { driver: DriverDetails } = route.params;

  const resetPasswordMutation = useResetDriverPassword();

  const handleResetPassword = () => {
    Alert.alert(
      "Reset Password",
      `Are you sure you want to reset the password for ${driver.drivername}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await resetPasswordMutation.mutateAsync({
                driverID: driver.driverID,
              });

              Toast.show({
                type: "success",
                text1: "Password Reset",
                text2:
                  response?.message ||
                  `Password for ${driver.drivername} has been reset.`,
              });
            } catch (error) {
              console.error("Failed to reset password:", error);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = () => {
    return driver.driverStatus === "Active"
      ? styles.statusActive
      : styles.statusInactive;
  };
  const statusStyle = getStatusStyle();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Main Info Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                driver.riderpic ||
                `https://placehold.co/200x200/png?font=poppins&text=${driver?.drivername[0].toUpperCase()}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.driverName}>{driver.drivername}</Text>
          <Text style={styles.companyName}>{driver.companyname}</Text>
          <Rating rating={driver.rating} />
          <View style={[styles.statusBadge, statusStyle.container]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {driver.driverStatus}
            </Text>
          </View>
        </View>

        {/* Account & Association Card */}
        <InfoCard title="Account & Association">
          <DetailRowWithIcon
            Icon={<UserIcon />}
            label="Username"
            value={driver.riderLoginAccountname}
          />
          <DetailRowWithIcon
            Icon={<UserIcon />}
            label="Associated Owner"
            value={driver.owneraccountName}
          />
        </InfoCard>

        {/* Contact Info Card */}
        <InfoCard title="Contact Information">
          <DetailRowWithIcon
            Icon={<PhoneIcon />}
            label="Mobile"
            value={driver.mobileNo}
          />
          <DetailRowWithIcon
            Icon={<PhoneIcon color={colors.status.success} />}
            label="WhatsApp"
            value={driver.whatsappno}
          />
          <DetailRowWithIcon
            Icon={<TelegramIcon />}
            label="Telegram"
            value={driver.telegramID}
          />
          <DetailRowWithIcon
            Icon={
              <Text style={styles.genderIconText}>
                {driver.isFemale === 1 ? "F" : "M"}
              </Text>
            }
            label="Gender"
            value={driver.isFemale === 1 ? "Female" : "Male"}
          />
          <DetailRowWithIcon
            Icon={<AddressIcon />}
            label="Address"
            value={driver.riderAddress}
          />
        </InfoCard>

        {/* License & Vehicle Card */}
        <InfoCard title="License & Vehicle">
          <DetailRowWithIcon
            Icon={<LicenseIcon />}
            label="License No."
            value={driver.licenseNo}
          />
          <DetailRowWithIcon
            Icon={<ClockIcon />}
            label="License Expiry"
            value={driver.licenseExpirydate}
          />
          <DetailRowWithIcon
            Icon={<Text style={styles.vehicleIcon}>🚗</Text>}
            label={driver.vehiclename}
            value={driver.vehicleno}
          />
        </InfoCard>

        {/* Payment Info Card */}
        <InfoCard title="Payment Details">
          <DetailRowWithIcon
            Icon={<PaymentMethod size={18} color={colors.gray[500]} />}
            label="GPay"
            value={driver.gpayno}
          />
          <DetailRowWithIcon
            Icon={<PaymentMethod size={18} color={colors.gray[500]} />}
            label="Paytm"
            value={driver.paytmno}
          />
        </InfoCard>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
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
        </View>
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
    paddingVertical: 20,
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
  driverName: {
    ...TYPOGRAPHY.header,
    marginTop: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginLeft: 8,
  },
  companyName: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "bold",
  },
  statusActive: {
    container: { backgroundColor: colors.status.success + "20" },
    text: { color: colors.status.success },
  },
  statusInactive: {
    container: { backgroundColor: colors.status.error + "20" },
    text: { color: colors.status.error },
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconWrapper: {
    width: 30,
    alignItems: "center",
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
  vehicleIcon: {
    fontSize: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  actionButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: "500",
    marginLeft: 12,
  },
  genderIconText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.gray[500],
  },
});

export default DriverDetailsScreen;
