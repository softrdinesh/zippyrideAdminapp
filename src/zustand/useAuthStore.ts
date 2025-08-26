import { create } from "zustand";
import { getItem, setItem, removeItem } from "../utils/mmkvStorage";

interface OwnerProfile {
  id: number;
  username: string;
  token: string;
  isVehicleTag: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isVehicleTag: boolean;
  ownerProfile: OwnerProfile | null;
  token: string | null;
  authenticateOwner: (profile: OwnerProfile) => void;
  logoutOwner: () => void;
  setIsVehicleTag: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: getItem("isAuthenticated") === "true",
  isVehicleTag: getItem("isVehicleTag") === "true",
  ownerProfile: JSON.parse(getItem("ownerProfile") || "null"),
  token: getItem("token"),

  authenticateOwner: (profile: any) => {
    set({
      isAuthenticated: true,
      ownerProfile: profile,
      isVehicleTag: profile.isVehicleTag,
      token: profile.token,
    });
    setItem("isAuthenticated", "true");
    setItem("ownerProfile", JSON.stringify(profile));
    setItem("token", profile.token);
  },

  logoutOwner: () => {
    set({
      isAuthenticated: false,
      ownerProfile: null,
      isVehicleTag: false,
      token: null,
    });
    removeItem("isAuthenticated");
    removeItem("ownerProfile");
    removeItem("token");
  },

  setIsVehicleTag: (value: boolean) => {
    set({ isVehicleTag: value });
    setItem("isVehicleTag", value.toString());
  },
}));
