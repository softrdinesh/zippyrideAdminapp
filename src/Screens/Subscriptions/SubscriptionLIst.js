import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import axios from 'axios';
import { SvgXml } from 'react-native-svg';
import { TYPOGRAPHY } from "../../theme/typography";
import { config } from '../../services/config';
// SVG Icons (Smaller and more professional)
const userIcon = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#4F46E5" stroke-width="1.5"/>
  <path d="M20 22C20 19.2386 16.4183 17 12 17C7.58172 17 4 19.2386 4 22" stroke="#4F46E5" stroke-width="1.5"/>
</svg>
`;

const companyIcon = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H5M19 21H21M5 21H3M9 7H10M9 11H10M14 7H15M14 11H15M10 21V17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V21" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const phoneIcon = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 16.92V19.92C22 20.52 21.49 21.03 20.92 21.05C20.32 21.08 19.5 21 18.5 20.75C15.82 20.08 13.48 18.78 11.7 16.99C9.92 15.2 8.61 12.87 7.94 10.19C7.69 9.19 7.61 8.38 7.64 7.79C7.67 7.22 8.18 6.71 8.78 6.71H11.78C12.38 6.71 12.88 7.12 12.99 7.72C13.16 8.68 13.51 9.61 14.01 10.48C14.17 10.78 14.13 11.14 13.91 11.38L12.91 12.42C14.23 14.61 15.98 16.35 18.17 17.66L19.21 16.66C19.45 16.43 19.81 16.39 20.11 16.55C20.98 17.05 21.91 17.4 22.87 17.57C23.48 17.68 23.89 18.19 23.89 18.79L22 16.92Z" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const packageIcon = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 7L12 3L4 7M20 7V17L12 21M20 7L12 11M12 21V11M4 7L12 11" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const calendarIcon = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const expiredIcon = `
<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 5V10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const pendingIcon = `
<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 5V10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#D97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const filterIcon = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const dropdownIcon = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 9L12 15L18 9" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const API_URL = 'https://uat.zippyrideadminapi.projectpulse360.com/api/Admin/GetOwnerSubscriptioninfo?Command=All';

const { width, height } = Dimensions.get('window');
const FONT_FAMILY = {
  POPPINS_REGULAR: "Poppins-Regular",
  POPPINS_MEDIUM: "Poppins-Medium",
  POPPINS_BOLD: "Poppins-Bold",
};

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [dropdownAnim] = useState(new Animated.Value(0));

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Paid', value: 'PAD' },
    { label: 'Pending', value: 'PND' },
  ];

  const fetchSubscriptions = async (filterValue = selectedFilter) => {
    console.log('Fetching with filter:', filterValue);
    try {
      setLoading(true);
      const response = await axios.get(`${config.BASE_URL}api/Admin/GetOwnerSubscriptioninfo?Command=${filterValue}`);
      const data = response.data;
      setSubscriptions(data);
      setFilteredSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    applyFilter(selectedFilter);
  }, [subscriptions, selectedFilter]);

  const applyFilter = (filter) => {
    console.log('Applying filter:', filter);
    if (filter === 'All') {
      setFilteredSubscriptions(subscriptions);
    } else {
      // For PAD and PND filters, we don't need to filter locally
      // because the API already returns filtered data
      setFilteredSubscriptions(subscriptions);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const toggleFilterModal = () => {
    if (filterModalVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setFilterModalVisible(false));
    } else {
      setFilterModalVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleFilterSelect = (filterValue) => {
    console.log('Filter selected:', filterValue);
    setSelectedFilter(filterValue);
    toggleFilterModal();
    // Fetch new data based on selected filter
    setRefreshing(true);
    fetchSubscriptions(filterValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-SG');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return '#DC2626';
      case 'Pending':
        return '#D97706';
      case 'Active':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return expiredIcon;
      case 'Pending':
        return pendingIcon;
      default:
        return pendingIcon;
    }
  };

  const getFilterLabel = (value) => {
    const option = filterOptions.find(opt => opt.value === value);
    return option ? option.label : 'All Subscriptions';
  };

  const SubscriptionCard = ({ item }) => (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userIconContainer}>
            <SvgXml xml={userIcon} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.loginId} numberOfLines={1}>{item.loginID}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.pendinginfo)}15` }]}>
          <SvgXml xml={getStatusIcon(item.pendinginfo)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.pendinginfo) }]}>
            {item.pendinginfo}
          </Text>
        </View>
      </View>

      {/* Company Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <SvgXml xml={companyIcon} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value} numberOfLines={1}>{item.companyname || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <View style={styles.iconContainer}>
              <SvgXml xml={phoneIcon} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Mobile</Text>
              <Text style={styles.value}>{item.mobileno || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <View style={styles.iconContainer}>
              {/* <SvgXml xml={phoneIcon} /> */}
              <Image source={require('../../assets/whatsapp_.png')} style={{height:15,width:15}}  />

            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>WhatsApp</Text>
              <Text style={styles.value}>{item.whatsappno || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Package & Payment Info */}
      <View style={styles.detailsSection}>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <SvgXml xml={packageIcon} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Package</Text>
              <Text style={styles.packageValue} numberOfLines={1}>{item.packagename || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Last Paid</Text>
              <Text style={styles.paymentValue} numberOfLines={1}>
                {item.lastpaidamount ? formatCurrency(item.lastpaidamount) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Address Section */}
      <View style={styles.addressSection}>
        <Text style={styles.addressLabel}>Address</Text>
        <Text style={styles.addressValue} numberOfLines={2}>{item.address || 'N/A'}</Text>
      </View>

      {/* Next Payment Section */}
      {item.nextpaymentdate && (
        <View style={styles.nextPaymentSection}>
          <View style={styles.nextPaymentRow}>
            <View style={styles.iconContainer}>
              <SvgXml xml={calendarIcon} />
            </View>
            <Text style={styles.nextPaymentLabel}>Next Payment: </Text>
            <Text style={styles.nextPaymentValue}>{(item.nextpaymentdate)}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const FilterDropdown = () => {
    const rotateAnim = dropdownAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilterModal}>
          <SvgXml xml={filterIcon} />
          <Text style={styles.filterButtonText}>{getFilterLabel(selectedFilter)}</Text>
          <Animated.View style={{ transform: [{ rotate: rotateAnim }] }}>
            <SvgXml xml={dropdownIcon} />
          </Animated.View>
        </TouchableOpacity>

        <Modal
          visible={filterModalVisible}
          transparent
          animationType="fade"
          onRequestClose={toggleFilterModal}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={toggleFilterModal}
          >
            <View style={styles.filterModal}>
              <Text style={styles.filterTitle}>Filter Subscriptions</Text>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedFilter === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterSelect(option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading Subscriptions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
    
        <FilterDropdown />
      </View>

      {/* Subscription List */}
      <FlatList
        data={filteredSubscriptions}
        renderItem={({ item }) => <SubscriptionCard item={item} />}
        keyExtractor={(item) => item.userID.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subscriptions found</Text>
            <Text style={styles.emptySubtext}>Try changing your filter criteria</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.015,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: width * 0.045,
      ...TYPOGRAPHY.title,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: width * 0.032,
    color: '#64748B',
          ...TYPOGRAPHY.body,

  },
  filterContainer: {
    position: 'relative',
    alignItems:'center'
    
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: width * 0.3,
  },
  filterButtonText: {
    fontSize: width * 0.032,
    color: '#64748B',
    fontWeight: '500',
          ...TYPOGRAPHY.body,
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: height * 0.15,
    alignItems: 'flex-end',
    paddingRight: width * 0.04,
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: width * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  filterTitle: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#1E293B',
              ...TYPOGRAPHY.body,

    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#4F46E5',
  },
  filterOptionText: {
    fontSize: width * 0.033,
              ...TYPOGRAPHY.body,

    color: '#64748B',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.012,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.018,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  userIconContainer: {
    marginTop: 2,
  },
  userDetails: {
    marginLeft: 10,
    flex: 1,
  },
  loginId: {
    fontSize: width * 0.038,
    fontWeight: '600',
              ...TYPOGRAPHY.body,

    color: '#1E293B',
    marginBottom: 2,
  },
  userId: {
    fontSize: width * 0.028,
    color: '#64748B',
              ...TYPOGRAPHY.body,

    fontWeight: '400',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: width * 0.028,
    fontWeight: '600',
fontFamily:FONT_FAMILY.POPPINS_REGULAR,
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: height * 0.015,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactSection: {
    marginBottom: height * 0.015,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
  },
  detailsSection: {
    marginBottom: height * 0.015,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
  },
  iconContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: width * 0.028,
    color: '#64748B',
    fontWeight: '500',
                  ...TYPOGRAPHY.body,

    marginBottom: 2,
  },
  value: {
    fontSize: width * 0.032,
    color: '#1E293B',
                  ...TYPOGRAPHY.body,

    fontWeight: '500',
  },
  packageValue: {
    fontSize: width * 0.032,
    color: '#7C3AED',
                      ...TYPOGRAPHY.body,

    fontWeight: '600',
  },
  paymentValue: {
    fontSize: width * 0.032,
    color: '#1E293B',
    fontWeight: '600',
                      ...TYPOGRAPHY.body,

  },
  addressSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: height * 0.015,
    marginBottom: height * 0.012,
                      ...TYPOGRAPHY.body,

  },
  addressLabel: {
    fontSize: width * 0.028,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 6,
                      ...TYPOGRAPHY.body,

  },
  addressValue: {
    fontSize: width * 0.032,
    color: '#1E293B',
    fontWeight: '400',
    lineHeight: 20,
  },
  nextPaymentSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: height * 0.012,
  },
  nextPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextPaymentLabel: {
    fontSize: width * 0.028,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
  },
  nextPaymentValue: {
    fontSize: width * 0.028,
    color: '#DC2626',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: width * 0.035,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.2,
  },
  emptyText: {
    fontSize: width * 0.038,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: width * 0.032,
    color: '#94A3B8',
    fontWeight: '400',
  },
});

export default SubscriptionList;