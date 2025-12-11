import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../zustand/useAuthStore";

import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import { useActiveOwnerId } from "../../zustand/useAuthStore";
import {
  useGetPaymentInfo,
  useGenerateRazorpayOrder,
  useUpdateOnlinePayment,
  useUpdateFailedPayment,
} from "../../services/api/payment";
import { config } from "../../services/config";
import { useFocusEffect } from "@react-navigation/native";

const CheckCircleIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 24 24">
    <Path
      fill={colors.status.success}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    />
  </Svg>
);

const PaymentScreen: React.FC = () => {
  const activeOwnerId = useActiveOwnerId();
  const [isPaying, setIsPaying] = useState(false);
  const { userProfile, userRole, logoutUser } = useAuthStore();

  const {
    data: paymentInfo,
    isLoading: isLoadingInfo,
    isError,
    refetch,
  } = useGetPaymentInfo(activeOwnerId);

  const generateOrderMutation = useGenerateRazorpayOrder();
  const updatePaymentMutation = useUpdateOnlinePayment();
  const updateFailedPaymentMutation = useUpdateFailedPayment();

  // Calculate total amount and check if there are pending payments
  const totalAmount = paymentInfo?.reduce((total, payment) => total + (payment.amount || 0), 0) || 0;
  const hasPendingPayments = totalAmount > 0;
  const pendingVehicles = paymentInfo?.filter(payment => payment.amount > 0) || [];

  const handlePayment = async () => {
    if (!totalAmount || pendingVehicles.length === 0) return;

    setIsPaying(true);
    let orderIdForFailureHandling: string | null = null;

    try {
      const formdata = new FormData();
      formdata.append("amount", totalAmount * 100);
      formdata.append("currency", "INR");

      const order = await generateOrderMutation.mutateAsync(formdata);

      if (!order || !order.id) {
        throw new Error("Failed to generate payment order.");
      }
      orderIdForFailureHandling = order.id;

      const options = {
        description: "Payment for services",
        currency: "INR",
        key: config.RAZOR_PAY_KEY,
        amount: order.amount.toString(),
        name: "ZippyRide Admin",
        order_id: order.id,
        prefill: {
          contact: userProfile?.mobileno || "9999999999",
          name: userProfile?.username || "Admin User",
          // contact: "9999999999",
          // name:  "Admin User",
        },
        theme: { color: colors.brand.primary },
      };

      const paymentResponse = await RazorpayCheckout.open(options);
      console.log("paymentResponse", paymentResponse);

      // Update payment for all pending vehicles
   const updatePromises = pendingVehicles.map((vehicle, index) => {
  const payload = {
    ownerID: activeOwnerId,
    // vehicleID: vehicle.vehicleID,
    paidamount: totalAmount,
    razorpaymentID: paymentResponse.razorpay_payment_id,
  };

  console.log(`🔹 [${index + 1}] updateOnlinePayment payload:`, payload);

  return updatePaymentMutation.mutateAsync(payload);
});

await Promise.all(updatePromises);


      Toast.show({
        type: "success",
        text1: "Payment Successful!",
        text2: `Payment processed for ${pendingVehicles.length} vehicle(s).`,
      });

      refetch();
    } catch (error) {
      console.error("Payment Failed:", error);

      const isCancelledByUser = error.code === 0;

      if (activeOwnerId && orderIdForFailureHandling) {
        try {
          const failurePayload = {
            ownerID: activeOwnerId,
            razorpaymentID: orderIdForFailureHandling,
            amount: totalAmount,
            isCancelpayment: isCancelledByUser,
            ispaymentFail: !isCancelledByUser,
          };

          await updateFailedPaymentMutation.mutateAsync(failurePayload);
          console.log("Payment failure successfully logged to backend.");
        } catch (backendError) {
          console.error(
            "Failed to log payment failure to backend:",
            backendError
          );
        }
      }

      if (isCancelledByUser) {
        Toast.show({ type: "info", text1: "Payment Cancelled" });
      } else {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: error.description || error.message,
        });
      }
    } finally {
      setIsPaying(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (isLoadingInfo) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loaderText}>Checking payment status...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.description}>
            Failed to load payment information. Please try again.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => refetch()}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no pending payments
  if (!hasPendingPayments) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <CheckCircleIcon />
          <Text style={styles.title}>All Cleared!</Text>
          <Text style={styles.description}>
            You have no pending payments at the moment.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If there are pending payments
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Due</Text>
          <Text style={styles.totalAmount}>
            Total: ₹ {totalAmount.toFixed(2)}
          </Text>
          <Text style={styles.description}>
            Please clear your outstanding balance to continue using our services.
          </Text>
        </View>

        {/* Vehicle Cards */}
        <View style={styles.cardContainer}>
          {pendingVehicles.map((vehicle, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.vehicleNumber}>Vehicle No :  {vehicle.vehicleno}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.amountLabel}>Amount Due</Text>
                <Text style={styles.cardAmount}>₹ {vehicle.amount.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isPaying && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={isPaying}
        >
          {isPaying ? (
            <ActivityIndicator color={colors.base.white} />
          ) : (
            <Text style={styles.buttonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    ...TYPOGRAPHY.body,
    marginTop: 16,
  },
  title: {
    ...TYPOGRAPHY.header,
    fontSize: 18,
    marginBottom: 6,
  },
  totalAmount: {
    ...TYPOGRAPHY.header,
    fontSize: 22,
    color: colors.brand.primary,
    marginBottom: 6,
  },
  description: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    textAlign: "center",
    color: colors.gray[500],
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: 8,
    marginBottom: 8,
  },
  vehicleNumber: {
    ...TYPOGRAPHY.header,
    fontSize: 15,
    color: "black",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    ...TYPOGRAPHY.body,
    color: colors.gray[600],
    fontSize: 12,
  },
  cardAmount: {
    ...TYPOGRAPHY.header,
    fontSize: 16,
    color: colors.brand.primary,
  },
  button: {
    width: "100%",
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  buttonText: {
    ...TYPOGRAPHY.button,
  },
});

export default PaymentScreen;