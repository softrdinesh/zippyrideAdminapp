import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import Toast from "react-native-toast-message";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import {
  ComplaintListItem,
  useUpdateComplaint,
} from "../../services/api/admin-complaints";
// import { ComplaintListItem, useUpdateComplaint } from "../../services/api";
// ... (Import your icons here)

// --- Reusable Components ---
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

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

const ComplaintDetailsScreen: React.FC = ({ route, navigation }: any) => {
  const { complaint }: { complaint: ComplaintListItem } = route.params;

  const [isModalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState("");
  const updateComplaintMutation = useUpdateComplaint();

  const handleUpdateCase = async () => {
    if (!comments.trim()) {
      Toast.show({ type: "error", text1: "Please enter a comment." });
      return;
    }
    try {
      await updateComplaintMutation.mutateAsync({
        id: complaint.id,
        caseno: complaint.caseno,
        comments: comments,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Case has been updated.",
      });
      setModalVisible(false);
      navigation.goBack(); // Go back to the list screen after successful update
    } catch (error) {
      console.error("Failed to update case:", error);
    }
  };

  const statusStyle =
    complaint.caseStatus === "Open" ? styles.statusOpen : styles.statusClosed;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <InfoCard title="Case Details">
          <DetailRow label="Case Number" value={complaint.caseno} />
          <DetailRow label="Category" value={complaint.compliantCategoryname} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, statusStyle.container]}>
              <Text style={[styles.statusText, statusStyle.text]}>
                {complaint.caseStatus}
              </Text>
            </View>
          </View>
          <DetailRow label="Case Opened" value={complaint.caseOpenedDate} />
          {complaint.caseClosedDate && (
            <DetailRow label="Case Closed" value={complaint.caseClosedDate} />
          )}
        </InfoCard>

        <InfoCard title="Complainant Information">
          <DetailRow label="Name" value={complaint.compliantpersonname} />
          <DetailRow label="Mobile" value={complaint.compliantPersonMobileno} />
          <DetailRow
            label="WhatsApp"
            value={complaint.compliantPersonWhatsappno}
          />
          <DetailRow label="Address" value={complaint.compliantPersonadderss} />
        </InfoCard>

        {/* Complaint Message Card */}
        <InfoCard title="Complaint Message">
          <Text style={styles.complaintMessage}>
            {complaint.compliantMessage}
          </Text>
        </InfoCard>
      </ScrollView>

      {/* Update Button */}
      {complaint.caseStatus === "Open" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Update Case Status</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Update Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Complaint</Text>
            <Text style={styles.modalSubtitle}>
              Add comments to close this case. This action cannot be undone.
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter resolution comments..."
              placeholderTextColor={colors.gray[300]}
              multiline
              value={comments}
              onChangeText={setComments}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleUpdateCase}
                disabled={updateComplaintMutation.isPending}
              >
                {updateComplaintMutation.isPending ? (
                  <ActivityIndicator color={colors.base.white} />
                ) : (
                  <Text style={styles.modalButtonText}>Close Case</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  contentContainer: { padding: 24, paddingBottom: 100 },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  detailLabel: { ...TYPOGRAPHY.body, color: colors.gray[500], flex: 1 },
  detailValue: {
    ...TYPOGRAPHY.body,
    fontWeight: "500",
    flex: 1.5,
    textAlign: "right",
  },
  complaintMessage: {
    ...TYPOGRAPHY.body,
    lineHeight: 22,
    color: colors.gray[600],
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: "bold" },
  statusOpen: {
    container: { backgroundColor: colors.status.error + "20" },
    text: { color: colors.status.error },
  },
  statusClosed: {
    container: { backgroundColor: colors.status.success + "20" },
    text: { color: colors.status.success },
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: colors.base.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  button: {
    backgroundColor: colors.brand.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { ...TYPOGRAPHY.button },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: { ...TYPOGRAPHY.header, textAlign: "center" },
  modalSubtitle: {
    ...TYPOGRAPHY.body,
    color: colors.gray[400],
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  textInput: {
    ...TYPOGRAPHY.body,
    height: 100,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: colors.gray[100],
  },
  modalActions: { flexDirection: "row", marginTop: 20, gap: 12 },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.brand.primary,
  },
  modalButtonText: { ...TYPOGRAPHY.button, fontSize: 14 },
  cancelButton: { backgroundColor: colors.gray[100] },
  cancelButtonText: { color: colors.gray[600] },
});

export default ComplaintDetailsScreen;
