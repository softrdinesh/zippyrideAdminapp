// App.js
import React, { useEffect, useRef,useState } from 'react';
import { View, PermissionsAndroid, AppState,Text,TouchableOpacity, StyleSheet, BackHandler, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNetInfo } from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import { store } from './src/Reudx/slices/store';
import BottomTabs from './Bottomtabs';
import Common from './src/Screens/Common/Common'
import Navbar from './src/Screens/Navbar/Navbar'
enableScreens();

import Login from './src/Screens/Auth/Login';
import Register from './src/Screens/Auth/Register';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef();
    const [showModal, setShowModal] = useState(true);

  const appState = useRef(AppState.currentState);

  const isAppClosed = useRef(false);
  const notificationQueue = useRef([]);
  const [isModalVisible, setModalVisible] = useState(false);





  
  return (
    <Provider store={store}>

      <SafeAreaProvider>
          <NavigationContainer 
            ref={navigationRef}
            onReady={() => {
              // Process any queued notifications once navigation is ready
             
            }}
          >
            <Stack.Navigator
              initialRouteName="Common"
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              {/* Auth Screens */}
              <Stack.Screen name="Login" component={Login} />
                            <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="Main" component={BottomTabs} options={{ gestureEnabled: false }} />
   
              <Stack.Screen name="Common" component={Common} />
              <Stack.Screen name="Navbar" component={Navbar} />

            </Stack.Navigator>
          </NavigationContainer>
      
        <>
     
      </>
        
      </SafeAreaProvider>
</Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
   modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
