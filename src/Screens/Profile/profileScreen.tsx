import { View, Text, Pressable } from "react-native";
import React from "react";
import { PRIMARY, PRIMARY_TEXT, WHITE } from "../../uikit/UikitUtils/colors";
import { useAuthStore } from "../../zustand/useAuthStore";

const ProfileScreen = () => {
  const { logoutOwner } = useAuthStore();
  const handleLogout = () => {};
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable
        style={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: PRIMARY,
          borderRadius: 10,
        }}
        onPress={logoutOwner}
      >
        <Text style={{ color: WHITE }}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default ProfileScreen;
