import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import SvgBack from '../../icons/SvgBack';
import SvgHamburger from '../../icons/SvgHamburger';
import Flex from '../../uikit/Flex/Flex';
import Text from '../../uikit/Text/Text';
import {PRIMARY, WHITE} from '../../uikit/UikitUtils/colors';
import {routesPath} from '../routes/routesPath';
// import {getAddressMiddleWare} from '../modules/mapmodule/store/mapMiddleware';
// import {API_KEY} from '../../uikit/UikitUtils/constants';
import SvgLocation2 from '../../icons/SvgLocation2';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GEO_LOCATION } from '../utils/localStoreConstants';

const styles = StyleSheet.create({
  overAll: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  boxStyle: {
    backgroundColor: WHITE,
    marginRight: 16,
    padding: 6,
    borderRadius: 8,
  },
  hamburgerStyle: {
    padding: 12,
    backgroundColor: WHITE,
    borderRadius: 8,
  },
  locationStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const Header = ({ navigation }) => {
 

  const handleOpenDrawer = () => {
  navigation.navigate('Navbar'); // ✅ Navigate to screen named 'Navbar'
  };



  return (
    <Flex between row center overrideStyle={styles.overAll}>
   
      <Flex row center>
     
      </Flex>

        <Pressable style={styles.hamburgerStyle} onPress={handleOpenDrawer}>
          <SvgHamburger fill={WHITE} width={14} height={8} />
        </Pressable>
 
    </Flex>
  );
};

export default Header;
