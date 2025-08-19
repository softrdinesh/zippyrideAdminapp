import { create } from "zustand";
import { getItem, setItem, removeItem } from "../utils/mmkvStorage";

interface OwnerProfile {
  id: string;
  username: string;
  token: string;
  isFirstLogin: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  ownerProfile: OwnerProfile | null;
  token: string | null;
  authenticateOwner: (profile: OwnerProfile) => void;
  logoutOwner: () => void;
  setFirstLogin: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: getItem("isAuthenticated") === "true",
  isFirstLogin: getItem("isFirstLogin") === "true",
  ownerProfile: JSON.parse(getItem("ownerProfile") || "null"),
  token: getItem("token"),

  authenticateOwner: (profile: any) => {
    set({
      isAuthenticated: true,
      ownerProfile: profile,
      isFirstLogin: profile.isFirstLogin,
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
      isFirstLogin: false,
      token: null,
    });
    removeItem("isAuthenticated");
    removeItem("ownerProfile");
    removeItem("token");
  },

  setFirstLogin: (value: boolean) => {
    set({ isFirstLogin: value });
    setItem("isFirstLogin", value.toString());
  },
}));
