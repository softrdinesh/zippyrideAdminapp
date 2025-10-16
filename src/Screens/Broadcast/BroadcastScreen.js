import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Dropdown } from "react-native-element-dropdown";
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import axios from 'axios';
import { useAuthStore } from "../../zustand/useAuthStore";
import NotificationBell from '../../icons/NotificationBell'
import { config } from '../../services/config';
import { TYPOGRAPHY } from "../../theme/typography";

const BroadcastMessageScreen = () => {
    const { userProfile } = useAuthStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isSending, setIsSending] = useState(false)
  const [locationData, setLocationData] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({
    title: '',
    message: '',
    location: '',
    users: '',
  });

 

  // Fetch locations on component mount
  React.useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch users when location changes
  React.useEffect(() => {
    if (selectedLocation && selectedLocation !== 'all') {
      fetchUsersByLocation(selectedLocation);
    } else if (selectedLocation === 'all') {
      // If "All Locations" is selected, clear users data or handle accordingly
      setUsersData([]);
      setSelectedUsers(null);
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    setIsLoadingLocations(true);
    try {
      const response = await axios.get(
        `${config.BASE_URL}api/Admin/GetLocations`,
        {
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const formattedLocations = response.data.map(location => ({
          label: location.name || location.locationname || location.label,
          value: location.id || location.locationID || location.value
        }));
        
        // Add "All Locations" option at the beginning
        setLocationData([
        //  { label: 'All Locations', value: 'all' },
          ...formattedLocations
        ]);
      }

    } catch (error) {
      console.error('Error fetching locations:', error);
      
      // Fallback to default locations if API fails
      setLocationData([
        { label: 'All Locations', value: 'all' },
        { label: 'New York', value: 'new_york' },
        { label: 'London', value: 'london' },
        { label: 'Tokyo', value: 'tokyo' },
      ]);
      
      // Optionally show error to user
      Alert.alert(
        'Notice',
        'Could not load locations from server. Using default locations.'
      );
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const fetchUsersByLocation = async (locationId) => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(
        `${config.BASE_URL}api/Admin/GetUserListByLocation?LocationID=${locationId}`,
        {
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const formattedUsers = response.data.map(user => ({
          label: user.name || user.username || user.email || `User ${user.id}`,
          value: user.id || user.userID || user.value
        }));
        
        // Add "All" option at the beginning of users list
        const usersWithAllOption = [
          { label: 'All', value: 'A' },
          ...formattedUsers
        ];
        
        setUsersData(usersWithAllOption);
        
        // Set "All" as default selected option
        setSelectedUsers('A');
        
        // Clear users error if any
        setErrors(prev => ({...prev, users: ''}));
      } else {
        // Add "All" option even if no users found
        const usersWithAllOption = [
          { label: 'All', value: 'A' }
        ];
        
        setUsersData(usersWithAllOption);
        setSelectedUsers('A');
        setErrors(prev => ({...prev, users: ''}));
      }

    } catch (error) {
      console.error('Error fetching users by location:', error);
      
      // Fallback with "All" option if API fails
      const usersWithAllOption = [
        { label: 'All', value: 'A' }
      ];
      
      setUsersData(usersWithAllOption);
      setSelectedUsers('A');
      setErrors(prev => ({...prev, users: ''}));
      
      // Optionally show error to user
      Alert.alert(
        'Notice',
        'Could not load users for selected location. Using default options.'
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const toggleGroupSelection = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      message: '',
      location: '',
      users: '',
    };

    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Please enter a message title';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Please enter the message content';
      isValid = false;
    }

    if (!selectedLocation) {
      newErrors.location = 'Please Select  location';
      isValid = false;
    }

    if (!selectedUsers) {
      newErrors.users = 'Please Select a user';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // const handleSendBroadcast = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   setIsSending(true);

      

  //   try {

  //     // Prepare API payload
  //     const payload = {
  //       broadcastTitle: title.trim(),
  //       boradcastMessage: message.trim(), // Note: API has typo "boradcastMessage"
  //       userID: selectedUsers == 'A' ? 0 : selectedUsers,
  //       isSendAll: selectedUsers == 'A' ? "A" : "N", // Dynamic based on user selection
  //       loginuserID: userProfile?.id
  //     };
    

  //     // Make API call
  //     const response = await axios.post(
  //       `${config.BASE_URL}api/Admin/SendBroadcastMessage`,
  //       payload,
  //       {
  //         headers: {
  //           'accept': '*/*',
  //           'Content-Type': 'application/json'
  //         }
  //       }
        
  //     );

  //     // Handle success response
  //     setIsSending(false);
  //     // setTimeout(() => {
  //     //         setShowSuccessPopup(true);
  //     // }, 2000);
  //     // Show success popup instead of Alert

      
  //     // Reset form after successful send
  //     setTimeout(() => {
  //       resetForm();
  //     }, 2000);
 
  //   } catch (error) {
  //     setIsSending(false);
      
  //     // Handle error response
  //     console.error('API Error:', error);
      
  //     let errorMessage = 'Failed to send broadcast. Please try again.';
      
  //     if (error.response) {
  //       // Server responded with error status
  //       errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
  //       console.error('Error Response:', error.response.data);
  //     } else if (error.request) {
  //       // Request made but no response
  //       errorMessage = 'No response from server. Check your internet connection.';
  //     } else {
  //       // Error in request setup
  //       errorMessage = error.message;
  //     }
      
  //     Alert.alert('Error', errorMessage);
  //   }
  // };
const handleSendBroadcast = async () => {
  if (!validateForm()) {
    return;
  }

  setIsSending(true);
  const startTime = Date.now();

  try {
    // Prepare API payload
    const payload = {
      broadcastTitle: title.trim(),
      boradcastMessage: message.trim(),
      userID: selectedUsers == 'A' ? 0 : selectedUsers,
      isSendAll: selectedUsers == 'A' ? "A" : "N",
      loginuserID: userProfile?.id
    };

    // Make API call
    const response = await axios.post(
      `${config.BASE_URL}api/Admin/SendBroadcastMessage`,
      payload,
      {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      }
    );

    // Calculate remaining time to ensure loader shows for at least 2 seconds
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 2000 - elapsedTime);

    setTimeout(() => {
      setIsSending(false);
      setShowSuccessPopup(true);
      
      // Reset form after successful send
      setTimeout(() => {
        resetForm();
      //  setShowSuccessPopup(false);
      }, 2000);
    }, remainingTime);

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 2000 - elapsedTime);

    setTimeout(() => {
      setIsSending(false);
      
      // Handle error response
      console.error('API Error:', error);
      
      let errorMessage = 'Failed to send broadcast. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        console.error('Error Response:', error.response.data);
      } else if (error.request) {
        errorMessage = 'No response from server. Check your internet connection.';
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }, remainingTime);
  }
};
  const resetForm = () => {
    setTitle('');
    setMessage('');
    setSelectedLocation(null);
    setSelectedUsers(null);
    setSelectedUsers(null); // Reset to null, will be set to 'A' when location is selected
    setSelectedGroups([]);
    setUsersData([]);
    setErrors({
      title: '',
      message: '',
      location: '',
      users: '',

    });
    // setShowSuccessPopup(false);
  };



  const DropdownIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#6B7280"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const BroadcastIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2" fill="#4F46E5" />
      <Path
        d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"
        stroke="#4F46E5"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );

  const LocationIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5 8.33C17.5 14.17 10 19.17 10 19.17C10 19.17 2.5 14.17 2.5 8.33C2.5 4.1 5.86 0.83 10 0.83C14.14 0.83 17.5 4.1 17.5 8.33Z"
        stroke="#F6A003"
        strokeWidth={1.5}
        fill="#F6A003"
      />
      <Circle cx="10" cy="8.33" r="2.5" fill="#fafafa" />
    </Svg>
  );

  const UserIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C7.33 12 2 13.34 2 16V18H18V16C18 13.34 12.67 12 10 12Z"
        fill="#F6A003"
      />
    </Svg>
  );

  const GroupIcon = ({ type = 'default' }) => {
    const colors = {
      users: '#10B981',
      premium: '#F59E0B',
      new: '#3B82F6',
      vip: '#8B5CF6',
      default: '#6B7280'
    };
    const color = colors[type] || colors.default;

    return (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path
          d="M13 6C13 7.66 11.66 9 10 9C8.34 9 7 7.66 7 6C7 4.34 8.34 3 10 3C11.66 3 13 4.34 13 6Z"
          fill={color}
        />
        <Path
          d="M16 11C14.34 11 4 12.68 4 15V17H16V15C16 12.68 14.34 11 16 11Z"
          fill={color}
          opacity="0.7"
        />
      </Svg>
    );
  };

  const CheckIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.67 5L7.5 14.17L3.33 10"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const SendIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const SuccessIcon = () => (
    <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
      <Circle cx="30" cy="30" r="30" fill="#10B981" />
      <Path
        d="M20 30L27.5 37.5L40 25"
        stroke="white"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const ErrorIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" fill="#DC2626" />
      <Path
        d="M8 4V9M8 11V12"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );

  const LoadingIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" stroke="#F6A003" strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M15 8a7 7 0 0 0-7-7"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );

  const isFormValid = title.trim() && message.trim() && selectedLocation && selectedUsers && selectedGroups.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Professional Header */}
        <View style={styles.professionalHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconTitle}>
              <View style={styles.headerIcon}>
                <NotificationBell />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Broadcast Message</Text>
                <Text style={styles.headerSubtitle}>
                  Send targeted notifications to users
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Form Container */}
          <View style={styles.formContainer}>
            
            {/* Title Section */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Message Title</Text>
                <Text style={styles.inputRequired}>*</Text>
              </View>
              <TextInput
                style={[
                  styles.input, 
                  title && styles.inputFilled,
                  errors.title && styles.inputError
                ]}
                placeholder="Enter Message Title"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (text.trim()) {
                    setErrors(prev => ({...prev, title: ''}));
                  }
                }}
                maxLength={300}
              />
              <View style={styles.inputFooter}>
                <View style={styles.errorContainer}>
                  {errors.title ? (
                    <View style={styles.errorRow}>
                      <ErrorIcon />
                      <Text style={styles.errorText}>{errors.title}</Text>
                    </View>
                  ) : (
                    <Text style={styles.inputHint}></Text>
                  )}
                </View>
                <Text style={[styles.charCount, title.length > 80 && styles.charCountWarning]}>
                  {title.length}/300
                </Text>
              </View>

              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Message Content</Text>
                <Text style={styles.inputRequired}>*</Text>
              </View>
              <TextInput
                style={[
                  styles.textArea, 
                  message && styles.inputFilled,
                  errors.message && styles.inputError
                ]}
                multiline
                numberOfLines={6}
                placeholder="Write your message here..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  if (text.trim()) {
                    setErrors(prev => ({...prev, message: ''}));
                  }
                }}
                maxLength={1000}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <View style={styles.errorContainer}>
                  {errors.message ? (
                    <View style={styles.errorRow}>
                      <ErrorIcon />
                      <Text style={styles.errorText}>{errors.message}</Text>
                    </View>
                  ) : (
                    <Text style={styles.inputHint}></Text>
                  )}
                </View>
                <Text style={[styles.charCount, message.length > 400 && styles.charCountWarning]}>
                  {message.length}/1000
                </Text>
              </View>

              <View style={styles.dropdownRow}>
                <View style={styles.dropdownWrapper}>
                  <View style={styles.dropdownLabelContainer}>
                    <LocationIcon />
                    <Text style={styles.dropdownLabel}>Location</Text>
                  </View>
                  <Dropdown
                    style={[
                      styles.dropdown, 
                      selectedLocation && styles.dropdownActive,
                      errors.location && styles.dropdownError
                    ]}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelected}
                    inputSearchStyle={styles.dropdownSearch}
                    data={locationData}
                    search
                    maxHeight={280}
                    labelField="label"
                    valueField="value"
                    placeholder={isLoadingLocations ? "Loading locations..." : "Select location"}
                    searchPlaceholder="Search..."
                    value={selectedLocation}
                    onChange={item => {
                      setSelectedLocation(item.value);
                      setSelectedUsers(null); // Reset user selection when location changes
                      if (item.value) {
                        setErrors(prev => ({...prev, location: ''}));
                      }
                    }}
                    renderRightIcon={DropdownIcon}
                    disable={isLoadingLocations}
                itemTextStyle={styles.dropdownItemText}
                  />
                  {errors.location && (
                    <View style={styles.dropdownErrorContainer}>
                      <ErrorIcon />
                      <Text style={styles.dropdownErrorText}>{errors.location}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.dropdownWrapper}>
                  <View style={styles.dropdownLabelContainer}>
                    <UserIcon />
                    <Text style={styles.dropdownLabel}>User</Text>
                    {isLoadingUsers && <LoadingIcon />}
                  </View>
                  <Dropdown
                    style={[
                      styles.dropdown, 
                      selectedUsers && styles.dropdownActive,
                      errors.users && styles.dropdownError
                    ]}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelected}
                    inputSearchStyle={styles.dropdownSearch}
                    data={usersData}
                    search
                    maxHeight={280}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      isLoadingUsers 
                        ? "Loading users..." 
                        : selectedLocation === 'all'
                        ? "Select 'All Locations' first"
                        : !selectedLocation
                        ? "Select location first"
                        : usersData.length === 0
                        ? "No users found"
                        : "Select user"
                    }
                    searchPlaceholder="Search users..."
                    value={selectedUsers}
                    onChange={item => {
                      setSelectedUsers(item.value);
                      if (item.value) {
                        setErrors(prev => ({...prev, users: ''}));
                      }
                    }}
                    renderRightIcon={DropdownIcon}
                    disable={!selectedLocation || selectedLocation === 'all' || isLoadingUsers || usersData.length === 0}
                              itemTextStyle={styles.dropdownItemText}

              />
                  {errors.users && (
                    <View style={styles.dropdownErrorContainer}>
                      <ErrorIcon />
                      <Text style={styles.dropdownErrorText}>{errors.users}</Text>
                    </View>
                  )}
                  {selectedLocation && selectedLocation !== 'all' && usersData.length === 0 && !isLoadingUsers && (
                    <Text style={styles.noUsersText}>No users found for this location</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Summary Card */}
            {isFormValid && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                    <Circle cx="10" cy="10" r="8" fill="#3B82F6" opacity="0.1" />
                    <Path
                      d="M10 6V10L13 12"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                  <Text style={styles.summaryTitle}>Ready to Send</Text>
                </View>
                
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Recipients:</Text>
                    <Text style={styles.summaryValue}>
                      {getSelectedUsersCount().toLocaleString()} users
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Groups:</Text>
                    <Text style={styles.summaryValue}>{selectedGroups.length}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Location:</Text>
                    <Text style={styles.summaryValue}>
                      {locationData.find(l => l.value === selectedLocation)?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>User:</Text>
                    <Text style={styles.summaryValue}>
                      {selectedUsers === 'A' 
                        ? 'All Users' 
                        : usersData.find(u => u.value === selectedUsers)?.label
                      }
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
              ]}
              onPress={handleSendBroadcast}
              activeOpacity={0.8}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <ActivityIndicator color="white" />
                  <Text style={styles.sendButtonText}>Sending...</Text>
                </>
              ) : (
                <>
                  <SendIcon />
                  <Text style={styles.sendButtonText}>Send Broadcast</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Popup Modal */}
    <Modal
  visible={showSuccessPopup}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowSuccessPopup(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.successPopup}>
      {/* Animated Checkmark Icon */}
      <View style={styles.iconContainer}>
        <SuccessIcon />
      </View>
      
      {/* Success Title */}
      <Text style={styles.successTitle}>Success!</Text>
      
      {/* Success Message */}
      <Text style={styles.successMessage}>
        Broadcast message has been sent successfully!
      </Text>
      
      {/* Action Button */}
      <TouchableOpacity
        style={styles.successButton}
        onPress={() => {
          setShowSuccessPopup(false);
          resetForm();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.successButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  // Professional Header Styles
  professionalHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEBB2',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    padding: 16,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputRequired: {
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#F6A003',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputFilled: {
    borderColor: '#F6A003',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 13,
    color: '#94A3B8',
  },
  charCount: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  charCountWarning: {
    color: '#F59E0B',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#F6A003',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    minHeight: 120,
    lineHeight: 20,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dropdownItemText: {
    ...TYPOGRAPHY.body,
    color:'black'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  sectionDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 18,
  },
  dropdownRow: {
    gap: 12,
  },
  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  dropdownLabel: {
    
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dropdown: {
    height: 48,
    color:'black',
     ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: '#F6A003',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  dropdownActive: {
     ...TYPOGRAPHY.body,
    borderColor: '#F6A003',
    backgroundColor: '#FFFFFF',
  },
  dropdownError: {
         ...TYPOGRAPHY.body,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  dropdownPlaceholder: {
     ...TYPOGRAPHY.body,
    fontSize: 13,
    color: '#94A3B8',
  },
  dropdownSelected: {
    fontSize: 13,
     ...TYPOGRAPHY.body,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownSearch: {
     ...TYPOGRAPHY.body,
    height: 40,
    fontSize: 13,
    borderRadius: 8,
    borderColor: '#E2E8F0',
  },
  dropdownErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dropdownErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  noUsersText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 6,
    fontStyle: 'italic',
  },
  groupsSection: {
    marginTop: 8,
  },
  groupsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  groupCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
  },
  groupCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  groupCardError: {
    borderColor: '#DC2626',
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCheckboxActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  groupCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  groupCardFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  groupCardCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  groupCardLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  groupsErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  groupsErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  summaryContent: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '700',
  },
  sendButton: {
    backgroundColor: '#FFA000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#4F46E5',
    alignSelf:'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    height:50,
    width:180,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Success Popup Styles
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successPopup: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default BroadcastMessageScreen;