import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import {  userGetpaymenttranscation,userGetpaymentcancel,userGetpaymentfailure } from "../../services/api/admin-owner";
import { useAuthStore } from "../../zustand/useAuthStore";
import { colors } from "../../uikit/UikitUtils/colors";
import moment from 'moment';

// First Letter Icon Component
const FirstLetterIcon = ({ name, size = 32 }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  const colors = ['#F7931A', '#627EEA', '#345D9D', '#14F195', '#F3BA2F', '#23292F', '#EF4444', '#10B981', '#8B5CF6', '#06B6D4'];
  const color = colors[firstLetter.charCodeAt(0) % colors.length];
  

  return (
    <View style={[styles.letterIcon, { width: size, height: size, backgroundColor: color }]}>
      <Text style={styles.letterText}>{firstLetter}</Text>
    </View>
  );
};

// Search Icon
const SearchIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 20 20">
    <Circle cx="8" cy="8" r="6" stroke="#A0AEC0" strokeWidth="1.5" fill="none"/>
    <Path d="M12.5 12.5L17 17" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);


// Info Icon
const InfoIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="8" fill="#FE9A1C" />
    <Path d="M10 14V9M10 6H10.01" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

// Close Icon for Modal
const CloseIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6 6L18 18" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);


const App = () => {
  const { userProfile } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState('Success');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  


  const {
    data: transactions,
    isLoading,
    isError,
    refetch,
  } = userGetpaymenttranscation(userProfile?.id);

  const {
    data: cancledata,
  } = userGetpaymentcancel(userProfile?.id);

  const {
    data: failuredata,
  } = userGetpaymentfailure(userProfile?.id);

  // Map transaction data to crypto-like format for success transactions
  const getSuccessCryptoData = () => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions.map((transaction, index) => {
      const isPositive = parseFloat(transaction.paidamount || 0) > 0;
      
      return {
        name: transaction.ownername || 'Owner',
        pair: transaction.vehno  || 'N/A',
        companyname: transaction.companyname || 'Company',
        price: `₹${transaction.paidamount || '0.00'}`,
        change: Math.abs(parseFloat(transaction.paidamount || 0) / 100),
        positive: isPositive,
        paymentDate: transaction.paymentDate ? moment(transaction.paymentDate, 'M/D/YYYY h:mm:ss A').isValid() ? moment(transaction.paymentDate, 'M/D/YYYY h:mm:ss A').format('DD-MM-YYYY') : 'N/A' : 'N/A',
nextpaymentdate: transaction.nextpaymentdate ? moment(transaction.nextpaymentdate, 'M/D/YYYY h:mm:ss A').isValid() ? moment(transaction.nextpaymentdate, 'M/D/YYYY h:mm:ss A').format('DD-MM-YYYY') : 'N/A' : 'N/A',
transactionData: transaction,
        type: 'success'
      };
    });
  };

  // Map cancel data to crypto-like format
  const getCancelCryptoData = () => {
    if (!cancledata || !Array.isArray(cancledata)) return [];
    
    return cancledata.map((transaction, index) => {
      return {
        name: transaction.ownername || 'Owner',
        pair: transaction.vehno  || 'N/A',
        companyname: transaction.companyname || 'Company',
        price: `₹${transaction.paidamount || '0.00'}`,
        change: 0,
        positive: false,
        paymentDate: transaction.paymentDate ? moment(transaction.paymentDate, 'M/D/YYYY h:mm:ss A').format('DD-MM-YYYY') : 'N/A',
        nextpaymentdate: transaction.nextpaymentdate ? moment(transaction.nextpaymentdate, 'M/D/YYYY h:mm:ss A').format('DD-MM-YYYY') : 'N/A',
        transactionData: transaction,
        type: 'cancel'
      };
    });
  };

  // Map failure data to crypto-like format
  const getFailureCryptoData = () => {
    if (!failuredata || !Array.isArray(failuredata)) return [];
    
    return failuredata.map((transaction, index) => {
      return {
        name: transaction.ownername || 'Owner',
        pair: transaction.vehno  || 'N/A',
        companyname: transaction.companyname || 'Company',
        price: `₹${transaction.paidamount || '0.00'}`,
        change: 0,
        positive: false,
        paymentDate: transaction.paymentDate ? moment(transaction.paymentDate, 'M/D/YYYY h:mm:ss A').format('DD-MM-YYYY') : 'N/A',
        nextpaymentdate: transaction.nextpaymentdate ? moment(transaction.nextpaymentdate, 'M/D/YYYY h:mm:ss A').format('DD-MM-YYYY') : 'N/A',
        transactionData: transaction,
        type: 'failure'
      };
    });
  };

  // Get data based on selected filter
  const getFilteredData = () => {
    switch (selectedFilter) {
      case 'Success':
        return getSuccessCryptoData();
      case 'Failure':
        return getFailureCryptoData();
      case 'Cancel':
        return getCancelCryptoData();
      default:
        return getSuccessCryptoData();
    }
  };

  // Filter transactions based on search query and selected filter
  const filteredCryptoData = useMemo(() => {
    const cryptoData = getFilteredData();
    
    if (!searchQuery) {
      return cryptoData;
    }

    return cryptoData.filter((crypto) => {
      // Search filter - check company name, owner name, and vehicle number
      const matchesSearch = searchQuery === '' || 
        crypto.companyname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.pair?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [transactions, cancledata, failuredata, searchQuery, selectedFilter]);

  const handleInfoPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  // Show loading state only for initial transactions load
  if (isLoading && selectedFilter === 'Success') {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={colors.brand.primary} />
        <Text style={styles.loaderText}>Loading transactions...</Text>
      </View>
    );
  }

  const filters = [
    { id: 'Success', label: 'Success', color: '#10B981', bgColor: '#ECFDF5' },
    { id: 'Failure', label: 'Failure', color: '#EF4444', bgColor: '#FEF2F2' },
    { id: 'Cancel', label: 'Cancel', color: '#6B7280', bgColor: '#F3F4F6' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header with Close Button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
            
            {selectedTransaction && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Payment Date:</Text>
                  <Text style={styles.modalValue}>{(selectedTransaction.paymentDate)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Next Payment Date:</Text>
                  <Text style={styles.modalValue}>{(selectedTransaction.nextpaymentdate)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Vehicle No:</Text>
                  <Text style={styles.modalValue}>{selectedTransaction.pair}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Owner Name:</Text>
                  <Text style={styles.modalValue}>{selectedTransaction.name}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Company Name:</Text>
                  <Text style={styles.modalValue}>{selectedTransaction.companyname}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Paid Amount:</Text>
                  <Text style={[styles.modalValue, styles.amountValue]}>{selectedTransaction.price}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <Text style={[styles.modalValue, { 
                    color: selectedTransaction.type === 'success' ? '#10B981' : 
                           selectedTransaction.type === 'failure' ? '#EF4444' : '#6B7280'
                  }]}>
                    {selectedTransaction.type.toUpperCase()}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <SearchIcon />
          </View>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by company, owner name, or vehicle number..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterWrapper}>
            {filters.map((filter) => (
              <TouchableOpacity 
                key={filter.id}
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: selectedFilter === filter.id ? filter.color : filter.bgColor,
                    borderColor: selectedFilter === filter.id ? filter.color : '#E2E8F0'
                  }
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedFilter === filter.id ? '#FFFFFF' : filter.color }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Search Results Info */}
      {searchQuery && (
        <View style={styles.searchInfoContainer}>
          <Text style={styles.searchInfoText}>
            {filteredCryptoData.length} result(s) found for "{searchQuery}"
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Crypto List with ScrollView */}
      <ScrollView style={styles.cryptoList} showsVerticalScrollIndicator={false}>
        {filteredCryptoData.length > 0 ? (
          filteredCryptoData.map((crypto, index) => {
            // Determine status color based on type
            let statusColor = '#10B981'; // default success
            let statusText = 'Success';
            
            if (crypto.type === 'failure') {
              statusColor = '#EF4444';
              statusText = 'Failed';
            } else if (crypto.type === 'cancel') {
              statusColor = '#6B7280';
              statusText = 'Cancelled';
            }

            return (
              <View key={index} style={styles.cryptoItem}>
                <View style={styles.cryptoLeft}>
                  <FirstLetterIcon name={crypto.companyname} />
                  <View style={styles.cryptoInfo}>
                    <Text style={styles.cryptoCompany}>{crypto.companyname}</Text>
                    <Text style={styles.cryptoName}>{crypto.name}</Text>
                    <Text style={styles.cryptoVehicle}>{crypto.pair}</Text>
                  </View>
                </View>
                <View style={styles.cryptoRight}>
                  <View style={styles.amountContainer}>
                    <Text style={styles.cryptoPrice}>{crypto.price}</Text>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: statusColor }
                    ]}>
                      <Text style={styles.statusText}>
                        {statusText}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => handleInfoPress(crypto)}
                  >
                    <InfoIcon />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? `No ${selectedFilter.toLowerCase()} transactions found for "${searchQuery}"` : `No ${selectedFilter.toLowerCase()} transactions found`}
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                style={styles.tryAgainButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.tryAgainText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
         )} 
      </ScrollView>
    </SafeAreaView>
  );
};

// Professional Styles with proper font sizes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    fontWeight: '400',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  filterWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 25,
    width:12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonActive: {
    transform: [{ scale: 0.98 }],
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cryptoList: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  cryptoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cryptoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cryptoInfo: {
    marginLeft: 10,
    flex: 1,
  },
  cryptoCompany: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  cryptoName: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 2,
  },
  cryptoVehicle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },
  cryptoRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  cryptoPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoButton: {
    padding: 5,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  // Letter Icon Styles
  letterIcon: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  letterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  closeButton: {
    padding: 2,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  modalValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  amountValue: {
    color: '#10B981',
    fontWeight: '700',
  },
  modalCloseButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Search Info Styles
  searchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInfoText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  clearSearchText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    textAlign:'center',
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 18,
  },
  tryAgainButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tryAgainText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Loader Styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default App;