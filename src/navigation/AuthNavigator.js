import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../Screens/Auth/Login";
import Register from "../Screens/Auth/Register";

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
};
