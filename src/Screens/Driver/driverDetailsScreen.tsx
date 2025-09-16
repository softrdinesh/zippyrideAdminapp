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
import Svg, { Path } from "react-native-svg";
import {
  DriverDetails,
  useResetDriverPassword,
} from "../../services/api/driver";
import PaymentMethod from "../../icons/SvgPaymentMethod";
import Toast from "react-native-toast-message";

const PhoneIcon = ({ color = colors.gray[500] }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.23 1.02l-2.2 2.2z"
    />
  </Svg>
);
const AddressIcon = ({ color = colors.gray[500] }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
  </Svg>
);
const LicenseIcon = ({ color = colors.gray[500] }) => (
  <Svg
    fillRule="evenodd"
    clipRule="evenodd"
    width="18"
    height="18"
    viewBox="0 0 512 348.04"
    fill={color}
  >
    <Path d="M431.64 199.57c40.99-.32 74.49 32.64 74.82 73.64.32 41-32.64 74.5-73.64 74.83-41 .32-74.49-32.65-74.82-73.64-.33-41 32.64-74.5 73.64-74.83zM54.43 42.22h403.14c3.51 0 6.38 2.88 6.38 6.39v34.15c0 3.51-2.87 6.38-6.38 6.38H54.43c-3.51 0-6.38-2.87-6.38-6.38V48.61c0-3.52 2.87-6.39 6.38-6.39zM27.19 0h457.62c7.48 0 14.29 3.06 19.21 7.98 4.92 4.92 7.98 11.74 7.98 19.21v201.43a91.763 91.763 0 00-15.47-20.16l-.39-.37V27.19c0-3.1-1.28-5.94-3.34-7.99a11.273 11.273 0 00-7.99-3.34H27.19c-3.12 0-5.96 1.27-7.99 3.3l-.04.04c-2.03 2.03-3.3 4.87-3.3 7.99v262.66c0 3.11 1.28 5.94 3.34 8 2.05 2.05 4.89 3.33 7.99 3.33h317.54a90.949 90.949 0 006.65 15.86H27.19c-7.47 0-14.29-3.06-19.21-7.98C3.06 304.14 0 297.33 0 289.85V27.19c0-7.45 3.06-14.24 7.98-19.17l.04-.04C12.97 3.05 19.75 0 27.19 0zm115.49 204.93c8.07 6.96 31.12 4.88 39.74 9.68 2.74 1.53 5.23 3.49 7.22 6.12 4.94 6.52 5.32 8.91 7.21 16.88-.44 4.69-3.1 7.4-8.34 7.8H52.83c-5.24-.4-7.9-3.11-8.34-7.8 1.89-7.97 2.27-10.36 7.21-16.88 1.99-2.64 4.47-4.59 7.22-6.12 8.48-4.73 30.93-2.67 39.33-9.34 1.27-2.75 2.56-6.65 3.37-9.11.04-.13-.07.2.34-1.02.94-2.8-4.61-8.28-6.46-11.22l-6.88-10.95c-2.52-3.75-3.82-7.18-3.9-10-.04-1.32.18-2.52.67-3.58a6.66 6.66 0 012.37-2.75 8.62 8.62 0 011.66-.85c-.44-5.93-.61-10.44-.32-16.7.15-1.49.43-2.97.85-4.46 2.52-9 10.25-15.48 19.09-18.54 4.29-1.48 2.63-5.01 6.97-4.77 10.27.56 26.12 7.18 32.21 14.2 8.53 9.83 6.33 18.98 6.04 30.98 1.91.59 3.13 1.8 3.63 3.75.56 2.17-.04 5.23-1.88 9.41l-.01-.01c-.03.08-.07.15-.11.23l-7.84 12.91c-3.03 4.98-6.1 9.97-10.19 13.8-.2.19-.4.37-.61.55.6.83 1.29 1.85 2.03 2.93 1.07 1.57 2.24 3.29 3.4 4.86zm75.79-69.59c-3.65 0-6.61-3.95-6.61-8.81 0-4.87 2.96-8.82 6.61-8.82H349.4c3.65 0 6.61 3.95 6.61 8.82 0 4.86-2.96 8.81-6.61 8.81H218.47zm0 100.12c-3.65 0-6.61-3.94-6.61-8.81 0-4.87 2.96-8.81 6.61-8.81h141.14a91.256 91.256 0 00-10.66 17.62H218.47zm0-50.06c-3.65 0-6.61-3.95-6.61-8.81 0-4.87 2.96-8.82 6.61-8.82h197.17c3.65 0 6.61 3.95 6.61 8.82 0 4.86-2.96 8.81-6.61 8.81H218.47zM431.9 274a3.85 3.85 0 013.88 3.81c.01 2.13-1.69 3.86-3.81 3.87-2.12.02-3.86-1.69-3.87-3.8a3.835 3.835 0 013.8-3.88zm-.04-10.05c7.65-.07 13.91 6.09 13.97 13.74.06 7.66-6.09 13.91-13.74 13.98-7.66.05-13.91-6.1-13.97-13.75-.07-7.66 6.09-13.91 13.74-13.97zm-56.17-10.07c5.26-14.92 16.13-27.56 29.82-34.08 18.82-8.96 41.73-9.7 61.28 4.52 11.51 8.38 15.75 15.29 21.56 27.56 4.42 10.88.89 14.45-13.06 8.44-28.86-13.99-57.91-13.13-87.13.69-10.77 7.16-16.89 1.3-12.47-7.13zm74.47 77.31c20.02-6.48 31.64-19.36 38.7-35.72 4.58-12.64-10.12-16.79-15.19-8.45-3.04 6.14-6.66 11.41-11.43 15.51-7.43 6.43-18.28 7.67-19.87 19.69-.83 6.25.64 11.83 7.79 8.97zm-34.61.27c-20.12-6.16-31.95-18.85-39.27-35.09-4.77-12.56 9.85-16.95 15.06-8.7 3.13 6.09 6.84 11.3 11.67 15.34 7.54 6.3 18.4 7.38 20.19 19.36.92 6.24-.45 11.85-7.65 9.09z" />
  </Svg>
);
const StarIcon = ({ filled = true, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={filled ? colors.brand.secondary : colors.gray[200]}
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    />
  </Svg>
);
const ClockIcon = ({ color = colors.gray[500] }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12.5 7v5.5L17 15l-1 1.61-5.5-3.36V7h1.5z"
    />
  </Svg>
);
const TelegramIcon = ({ color = colors.gray[500] }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.62 12c-.88-.25-.88-1.37 0-1.62l16.84-6.37c.71-.27 1.36.22 1.15.99L19.34 18c-.16.58-.58.72-1.11.45l-4.88-3.58l-2.31 2.2a1.28 1.28 0 0 1-1.28.2z"
    />
  </Svg>
);

const KeyIcon = ({ color = colors.gray[500] }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
    />
  </Svg>
);

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
          <Rating rating={driver.rating} />
          <View style={[styles.statusBadge, statusStyle.container]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {driver.driverStatus}
            </Text>
          </View>
        </View>

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
            Icon={<AddressIcon />}
            label="Address"
            value={`${driver.riderAddress}`}
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
});

export default DriverDetailsScreen;
