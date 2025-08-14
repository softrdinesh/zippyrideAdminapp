import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import SvgHome from './src/icons/SvgHome';
import SvgUser from './src/icons/SvgUser';
import SvgGps from './src/icons/SvgGps';
import Landingpage from './src/Screens/landingScreen';
import Login from './src/Screens/Auth/Login';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landingpage" component={Landingpage} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landingpage" component={Landingpage} />
    </Stack.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <SvgHome fill={focused ? '#F84A01' : '#F6A000'} height={25} width={25} />;
          } else if (route.name === 'Rides') {
            return <SvgGps fill={focused ? '#F84A01' : '#F6A000'} height={25} width={25} />;
          } else if (route.name === 'Profile') {
            return <SvgUser fill={focused ? '#F84A01' : '#F6A000'} height={25} width={25} />;
          }
        },
        tabBarActiveTintColor: '#F84A01',
        tabBarInactiveTintColor: '#F6A000',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text style={{ 
              color, 
              fontSize: 12,
              marginBottom: 5 
            }}>
              {route.name}
            </Text>
          );
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getFocusedRouteNameFromRoute(route) === 'Landingpage' ? 'none' : 'flex',
            paddingBottom: 5,
            height: 60,
          },
        })}
      />
      
      <Tab.Screen
        name="Rides"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getFocusedRouteNameFromRoute(route) === 'Landingpage' ? 'none' : 'flex',
            paddingBottom: 5,
            height: 60,
          },
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getFocusedRouteNameFromRoute(route) === 'Landingpage' ? 'none' : 'flex',
            paddingBottom: 5,
            height: 60,
          },
        })}
      />
    </Tab.Navigator>
  );
}