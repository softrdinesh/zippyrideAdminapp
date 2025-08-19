import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../Screens/Auth/Login";
import Register from "../Screens/Auth/Register";
import Common from "../Screens/Common/Common";

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="Common" component={Common} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};
