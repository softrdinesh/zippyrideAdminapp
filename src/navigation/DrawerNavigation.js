import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, StyleSheet } from "react-native"; // Import StyleSheet
import { colors } from "../uikit/UikitUtils/colors";
import { VehicleNavigator } from "./VehicleStack";
import { CustomDrawerContent } from "../uikit/CustomDrawerContent";
import { TripsNavigator } from "./TripsStack";
import { DriverNavigator } from "./DriverStack";
import PaymentScreen from "../Screens/Payment/PaymentScreen";
import PaymentScreentrans from "../Screens/PaymentTransactions/Paymenttrans";
import BroadcastScreen from "../Screens/Broadcast/BroadcastScreen";
import { CustomHeader } from "../uikit/CustomDrawerHeader";
import Packagescreen from "../Screens/Package/Packagescreen";
import { useAuthStore } from "../zustand/useAuthStore";
import { OwnerNavigator } from "./OwnerStack";
import FeedbackScreen from "../Screens/Feedback/feedbacksListScreen";
import ComplaintScreen from "../Screens/Complaint/complaintListScreen";
import { ComplaintNavigator } from "./ComplaintStack";
// import {PaymenttranNavigator} from '../Screens/PaymentTransactions/Paymenttrans'
import PackagescreenList from '../Screens/Package/PackageListScreen'
import EditpackageScreen from '../Screens/Package/EditPackageScreen'
import { TYPOGRAPHY } from "../theme/typography";
import {useNavigation} from '@react-navigation/native'
const Drawer = createDrawerNavigator();
 
export const MainDrawer = () => {
  const { userRole } = useAuthStore();
   const navigation = useNavigation();
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
          <Drawer.Screen
        name="PackageListScreen"
        options={{
          title: "All Trip Packages",
           headerShown: true,
          onHeaderRightPress: () => {
            navigation.navigate("Packagescreen");
          },
          headerRightIcon: <Text style={styles.headerActionText}>Add</Text>,
        }}
        component={PackagescreenList}
      />
         <Drawer.Screen
        name="EditPackageScreen"
        options={{
          title: "Trip Packages",
           headerShown: true,
          onHeaderRightPress: () => {
            navigation.navigate("EditPackageScreen");
          },
        //  headerRightIcon: <Text style={styles.headerActionText}>Add</Text>,
        }}
        component={EditpackageScreen}
      />

      
            <Drawer.Screen
            name="BroadcastScreen"
            component={BroadcastScreen}
            options={{
              headerShown: true,
              title: "Broadcast",
            }}
          />
           <Drawer.Screen
            name="Packagescreen"
            component={Packagescreen}
            options={{
              headerShown: true,
              title: "Package",
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
const styles = StyleSheet.create({
  headerActionText: {
    ...TYPOGRAPHY.body,
    color: colors.brand.primary,
    fontWeight: "600",
  },
});
