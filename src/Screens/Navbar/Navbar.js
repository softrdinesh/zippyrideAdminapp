import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this import
import Text from '../../uikit/Text/Text';
import SvgMyorder from '../../icons/SvgMyorder';
import SvgCart from '../../icons/SvgCart';
import SvgHelp from '../../icons/SvgHelp';
import SvgClose from '../../icons/SvgClose';
import SvgBook from '../../icons/SvgBook';
import SvgEditProfile from '../../icons/SvgEditProfile';
import SvgLogout from '../../icons/SvgLogout';
import Button from '../../uikit/Button/Button';
import Flex from '../../uikit/Flex/Flex';
import { WHITE } from '../../uikit/UikitUtils/colors';
const {width,height} = Dimensions.get('window');

const DRAWER_WIDTH = width * 0.7;

const styles = StyleSheet.create({
  container: {
    width: DRAWER_WIDTH,
    backgroundColor: 'white',
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    padding: 8,
  },
   btnStyle: {
    width: 130,
    marginTop:height*0.25,
    backgroundColor:'#FEA816'
  },
    svgLogout: {
    backgroundColor: WHITE,
    borderRadius: 100,
    padding: 4,
    marginRight: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: 'black',
  },
});

const DrawerContent = () => {
  const navigation = useNavigation(); // Get navigation from hook
  
  const userDetails = {
    Name: 'TUFFY P',
    MobileNo: '+91-9042531799',
  };

  const menuItems = [
    { title: 'Edit Profile', icon: <SvgEditProfile width={20} height={20} /> },
    { title: 'My Orders', icon: <SvgMyorder width={20} height={20} /> },
    { title: 'Book Your Table', icon: <SvgBook width={20} height={20} /> },
    { title: 'My Cart', icon: <SvgCart width={20} height={20} /> },
    { title: 'Dining Booking Process', icon: <SvgHelp width={20} height={20} /> },
  ];

  

  const handleClose = () => {
    navigation.navigate("Login") // Proper way to close drawer
  };

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={handleClose} 
        style={styles.closeButton}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      >
        <SvgClose width={24} height={24} />
      </Pressable>

      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>{userDetails.Name}</Text>
        <Text style={styles.phoneText}>{userDetails.MobileNo}</Text>
      </View>

      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem}>
          <View style={styles.menuIcon}>{item.icon}</View>
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
       <Button
          width={150}
          round
          overrideStyle={styles.btnStyle}
      >
          <Flex row center>
            <View style={styles.svgLogout}>
              <SvgLogout />
            </View>
            <Text size={16} bold>
              Log Out
            </Text>
          </Flex>
        </Button>
    </View>
  );
};

export default DrawerContent;