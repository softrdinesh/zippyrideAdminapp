import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { VehicleNavigator } from "./VehicleStack";
import { CustomDrawerContent } from "../uikit/CustomDrawerContent";
import { TripsNavigator } from "./TripsStack";
import { DriverNavigator } from "./DriverStack";
import PaymentScreen from "../Screens/Payment/PaymentScreen";
import PaymentScreentrans from "../Screens/PaymentTransactions/Paymenttrans";

import { CustomHeader } from "../uikit/CustomDrawerHeader";
import { useAuthStore } from "../zustand/useAuthStore";
import { OwnerNavigator } from "./OwnerStack";
import FeedbackScreen from "../Screens/Feedback/feedbacksListScreen";
import ComplaintScreen from "../Screens/Complaint/complaintListScreen";
import { ComplaintNavigator } from "./ComplaintStack";
// import {PaymenttranNavigator} from '../Screens/PaymentTransactions/Paymenttrans'
const Drawer = createDrawerNavigator();

export const MainDrawer = () => {
  const { userRole } = useAuthStore();
  return (
    <Drawer.Navigator
      screenOptions={({ navigation, route }) => ({
        headerShown: false,
        header: ({ options }) => {
          const canGoBack = navigation.canGoBack();
          const title = options?.title || route.name;

          return (
            <CustomHeader
              title={title}
              canGoBack={canGoBack}
              onRightPress={options.onHeaderRightPress}
              rightIcon={options.headerRightIcon}
              onLeftPress={() => {
                if (canGoBack) {
                  navigation.goBack();
                } else {
                  navigation.getParent()?.openDrawer();
                }
              }}
            />
          );
        },
      })}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {userRole === "admin" ? (
        <>
          <Drawer.Screen
            name="OwnerManagement"
            component={OwnerNavigator}
            options={{ headerShown: false }}
          />

          <Drawer.Screen
            name="Feedback"
            component={FeedbackScreen}
            options={{ headerShown: true, title: "Feedbacks" }}
          />
          <Drawer.Screen name="Complaints" component={ComplaintNavigator} />
        </>
      ) : (
        <>
          <Drawer.Screen name="VehicleSetup" component={VehicleNavigator} />
          <Drawer.Screen name="TripDetails" component={TripsNavigator} />
 {/* <Drawer.Screen name="PaymenttranNavigator" component={PaymenttranNavigator} /> */}
  <Drawer.Screen
            name="PaymentTrans"
            component={PaymentScreentrans}
            options={{
              headerShown: true,
              title: "Payment Transactions",
            }}
          />
          
          <Drawer.Screen name="TrackYourDriver" component={DriverNavigator} />
          <Drawer.Screen
            name="PaymentScreen"
            component={PaymentScreen}
            options={{
              headerShown: true,
              title: "Payment",
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
};
