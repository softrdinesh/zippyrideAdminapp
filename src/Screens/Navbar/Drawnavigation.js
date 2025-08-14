import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from '../Auth/Login'

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
      {/* Your screens here */}
              <Drawer.Screen name="login" component={Login} />

    </Drawer.Navigator>
  );
}