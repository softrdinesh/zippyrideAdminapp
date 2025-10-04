import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import Svg, { Path } from "react-native-svg";
import {
  ComplaintListItem,
  useGetAllComplaints,
} from "../../services/api/admin-complaints";
import { useNavigation } from "@react-navigation/native";

const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      fill={colors.gray[400]}
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5a6.5 6.5 0 10-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
    />
  </Svg>
);
const AttachmentIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
    <Path
      fill={colors.gray[500]}
      d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
    />
  </Svg>
);

const AnimatedView = Animated.createAnimatedComponent(TouchableOpacity);

const ComplaintCard = ({
  item,
  index,
  onPress,
}: {
  item: ComplaintListItem;
  index: number;
  onPress?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const numberOfLines = 4;
  const statusStyle =
    item.caseStatus === "Open" ? styles.statusOpen : styles.statusClosed;

  const handleViewAttachment = async () => {
    if (!item.attachment || !item.attachfilename) return;

    Linking.openURL(item.attachment);
  };

  return (
    <AnimatedView
      style={styles.card}
      entering={FadeInUp.delay(index * 50)}
      layout={Layout.springify()}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.caseNumber}>{item.caseno}</Text>
          <View style={[styles.statusBadge, statusStyle.container]}>
            <Text style={[styles.statusText, statusStyle.text]}>
              {item.caseStatus}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.categoryName}>{item.compliantCategoryname}</Text>

      <TouchableOpacity
        onPress={() => canExpand && setIsExpanded(!isExpanded)}
        activeOpacity={0.9}
        disabled={!canExpand}
      >
        <Text
          style={styles.complaintMessage}
          numberOfLines={isExpanded ? undefined : numberOfLines}
          onTextLayout={({ nativeEvent: { lines } }) => {
            if (lines.length > numberOfLines && !canExpand) setCanExpand(true);
          }}
        >
          {item.compliantMessage}
        </Text>
        {canExpand && (
          <Text style={styles.readMoreText}>
            {isExpanded ? "Show Less" : "Show More"}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          <Text style={styles.footerLabel}>By:</Text> {item.compliantpersonname}
        </Text>
        <Text style={styles.footerDate}>{item.caseOpenedDate}</Text>
      </View>

      {item.attachment && (
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleViewAttachment}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.brand.primary} />
          ) : (
            <>
              <AttachmentIcon />
              <Text style={styles.attachmentText} numberOfLines={1}>
                {item.attachfilename}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </AnimatedView>
  );
};

const ComplaintListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: complaints, isLoading, isError } = useGetAllComplaints();
  const navigation = useNavigation();
  const filteredComplaints = useMemo(() => {
    let data = complaints || [];
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      console.log("lowercasedQuery", lowercasedQuery, data);

      data = data.filter(
        (item) =>
          item.caseno.toLowerCase().includes(lowercasedQuery) ||
          item.compliantpersonname.toLowerCase().includes(lowercasedQuery)
      );
    }
    return data;
  }, [complaints, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Case No or Person Name..."
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          color={colors.brand.primary}
        />
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <ComplaintCard
              item={item}
              index={index}
              onPress={() =>
                navigation.navigate("ComplaintDetails", { complaint: item })
              }
            />
          )}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Complaints Found</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[100] },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: { ...TYPOGRAPHY.body, flex: 1, height: 48, marginLeft: 8 },
  listContainer: { padding: 24, flexGrow: 1 },
  card: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  caseNumber: {
    ...TYPOGRAPHY.caption,
    fontWeight: "bold",
    color: colors.gray[500],
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: "bold" },
  statusOpen: {
    container: { backgroundColor: colors.status.error + "20" },
    text: { color: colors.status.error },
  },
  statusClosed: {
    container: { backgroundColor: colors.status.success + "20" },
    text: { color: colors.status.success },
  },
  categoryName: { ...TYPOGRAPHY.title, marginTop: 12, marginBottom: 8 },
  complaintMessage: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.gray[600],
  },
  readMoreText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  footerText: { ...TYPOGRAPHY.caption },
  footerLabel: { color: colors.gray[400] },
  footerDate: { ...TYPOGRAPHY.caption, color: colors.gray[400] },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "30%",
  },
  emptyText: { ...TYPOGRAPHY.header, fontSize: 18, color: colors.gray[600] },
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  attachmentText: {
    ...TYPOGRAPHY.caption,
    color: colors.gray[600],
    marginLeft: 10,
    flexShrink: 1,
  },
});

export default ComplaintListScreen;
