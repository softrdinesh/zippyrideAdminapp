import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";

import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import { useAuthStore } from "../../zustand/useAuthStore";
import {
  useGetPaymentInfo,
  useGenerateRazorpayOrder,
  useUpdateOnlinePayment,
  useUpdateFailedPayment,
} from "../../services/api/payment";
import { config } from "../../services/config";

const CheckCircleIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 24 24">
    <Path
      fill={colors.status.success}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    />
  </Svg>
);

const PaymentScreen: React.FC = () => {
  const { ownerProfile } = useAuthStore();
  const [isPaying, setIsPaying] = useState(false);

  const {
    data: paymentInfo,
    isLoading: isLoadingInfo,
    isError,
    refetch,
  } = useGetPaymentInfo(ownerProfile?.id);

  const generateOrderMutation = useGenerateRazorpayOrder();
  const updatePaymentMutation = useUpdateOnlinePayment();
  const updateFailedPaymentMutation = useUpdateFailedPayment();

  const handlePayment = async () => {
    if (!paymentInfo?.amount) return;

    setIsPaying(true);
    let orderIdForFailureHandling: string | null = null;

    try {
      const formdata = new FormData();
      formdata.append("amount", paymentInfo.amount * 100);
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
          contact: ownerProfile?.mobileno || "9999999999",
          name: ownerProfile?.username || "Admin User",
        },
        theme: { color: colors.brand.primary },
      };

      const paymentResponse = await RazorpayCheckout.open(options);
      console.log("paymentResponse", paymentResponse);

      await updatePaymentMutation.mutateAsync({
        ownerID: ownerProfile?.id,
        razorpaymentID: paymentResponse.razorpay_payment_id,
      });

      Toast.show({
        type: "success",
        text1: "Payment Successful!",
        text2: "Your payment has been processed.",
      });

      refetch();
    } catch (error) {
      console.error("Payment Failed:", error);

      const isCancelledByUser = error.code === 0;

      // Log the failure to your backend
      if (ownerProfile?.id && orderIdForFailureHandling) {
        try {
          // Construct the new payload based on the curl request
          const failurePayload = {
            ownerID: ownerProfile.id,
            razorpaymentID: orderIdForFailureHandling, // The API expects the order_id here
            amount: paymentInfo.amount,
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

      // Show a user-friendly message
      if (isCancelledByUser) {
        Toast.show({ type: "info", text1: "Payment Cancelled" });
      } else {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: error.description || error.message,
        });
      }
      // --- END OF UPDATED FAILURE LOGIC ---
    } finally {
      setIsPaying(false);
    }
  };

  // --- UI Rendering ---

  if (isLoadingInfo) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loaderText}>Checking payment status...</Text>
      </View>
    );
  }

  if (isError) {
    // ... Error handling for the initial fetch
  }

  // If payment is NOT pending
  if (!paymentInfo?.isPaymentPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <CheckCircleIcon />
          <Text style={styles.title}>All Cleared!</Text>
          <Text style={styles.description}>
            {paymentInfo?.message ||
              "You have no pending payments at the moment."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If payment IS pending
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Payment Due</Text>
        <Text style={styles.amount}>
          ₹ {paymentInfo?.amount?.toFixed(2) || "0.00"}
        </Text>
        <Text style={styles.description}>
          Please clear your outstanding balance to continue using our services.
        </Text>

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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
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
    marginBottom: 16,
  },
  amount: {
    ...TYPOGRAPHY.header,
    fontSize: 48,
    color: colors.brand.primary,
    marginBottom: 8,
  },
  description: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    color: colors.gray[500],
    marginBottom: 40,
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
