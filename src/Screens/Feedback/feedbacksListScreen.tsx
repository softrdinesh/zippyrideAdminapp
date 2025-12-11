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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { colors } from "../../uikit/UikitUtils/colors";
import { TYPOGRAPHY } from "../../theme/typography";
import { useGetAllFeedbacks, FeedbackListItem } from "../../services/api";
import Svg, { Path } from "react-native-svg";

// --- Reusable SVG Icons ---
const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      fill={colors.gray[400]}
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5a6.5 6.5 0 10-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
    />
  </Svg>
);
const CalendarIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      fill={colors.gray[600]}
      d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"
    />
  </Svg>
);

// --- Reusable Components ---
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const FeedbackCard = ({
  item,
  index,
}: {
  item: FeedbackListItem;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const numberOfLines = 5; // Show up to 5 lines of the large text initially

  return (
    <AnimatedTouchableOpacity
      style={styles.card}
      entering={FadeInUp.delay(index * 50)}
      // Animate layout changes when the card expands/collapses
      layout={Layout.springify()}
      onPress={() => canExpand && setIsExpanded(!isExpanded)}
      activeOpacity={0.9}
    >
      {/* The main feedback content, now with a larger font */}
      <Text
        style={styles.feedbackContent}
        numberOfLines={isExpanded ? undefined : numberOfLines}
        onTextLayout={(e) => {
          // Check if the text is long enough to need a "Read More" button
          if (e.nativeEvent.lines.length > numberOfLines && !canExpand) {
            setCanExpand(true);
          }
        }}
      >
        {item.feedbackContent}
      </Text>

      {/* "Read More" button appears only if needed */}
      {canExpand && (
        <Text style={styles.readMoreText}>
          {isExpanded ? "Show Less" : "Show More"}
        </Text>
      )}

      {/* Footer with author and date */}
      <View style={styles.cardFooter}>
        <Text style={styles.feedbackAuthor}>
          <Text style={styles.footerLabel}>Feedback given by:</Text>{" "}
          {item.feedbackGivenBy}
        </Text>
        <Text style={styles.footerDate}>{item.feedbackSubmittedDate}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );
};

// --- Main Screen Component ---
const FeedbackScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const { data: feedbacks, isLoading, isError } = useGetAllFeedbacks();

  // Client-side filtering logic
  const filteredFeedbacks = useMemo(() => {
    let data = feedbacks || [];

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.feedbackContent.toLowerCase().includes(lowercasedQuery) ||
          item.feedbackGivenBy.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Filter by selected date
    if (selectedDate) {
      const formattedDate = moment(selectedDate).format("DD-MM-YYYY");
      data = data.filter(
        (item) => item.feedbackSubmittedDate === formattedDate
      );
    }

    return data;
  }, [feedbacks, searchQuery, selectedDate]);

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  if (isLoading) {
    /* ... show loader ... */
  }
  if (isError) {
    /* ... show error ... */
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Filter Section */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by content or user..."
            placeholderTextColor={colors.gray[400]}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.dateFilterWrapper}>
          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <CalendarIcon />
            <Text style={styles.dateFilterText}>
              {selectedDate
                ? moment(selectedDate).format("DD MMM, YYYY")
                : "Filter by Date"}
            </Text>
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearDateFilter}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredFeedbacks}
        keyExtractor={(item) => item.feedbackID.toString()}
        renderItem={({ item, index }) => (
          <FeedbackCard item={item} index={index} />
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Feedback Found</Text>
            <Text style={styles.emptySubText}>
              There is no feedback matching your criteria.
            </Text>
          </View>
        )}
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
                        minimumDate={new Date()}

        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  listContainer: {
    padding: 24,
  },
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
  feedbackContent: {
    ...TYPOGRAPHY.body, // Use a base style
    fontSize: 16, // Make it larger
    lineHeight: 24, // Improve readability
    color: colors.text.primary,
    marginBottom: 12,
  },
  readMoreText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "bold",
    marginTop: -4, // Pull it closer to the text
    marginBottom: 16,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  feedbackAuthor: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: colors.text.primary,
  },
  footerLabel: {
    color: colors.gray[400],
    fontWeight: "normal",
  },
  footerDate: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: "30%",
  },
  emptyText: {
    ...TYPOGRAPHY.header,
    fontSize: 18,
    color: colors.gray[600],
  },
  // --- (Search and filter styles remain the same) ---
  controlsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
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
  dateFilterWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  dateFilterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 12,
  },
  dateFilterText: {
    ...TYPOGRAPHY.body,
    marginLeft: 10,
    color: colors.gray[600],
  },
  clearButton: { marginLeft: 12, padding: 8 },
  clearButtonText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "600",
  },
});

export default FeedbackScreen;
