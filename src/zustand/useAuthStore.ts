import { create } from "zustand";
import { mmkvStorageAdapter } from "../utils/mmkvStorage";
import { createJSONStorage, persist } from "zustand/middleware";

interface OwnerProfile {
  id: number;
  username: string;
  profilepic: string;
  mobileno: string;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isVehicleTag: false,
      ownerProfile: null,
      token: null,

      authenticateOwner: (profile) => {
        set({
          isAuthenticated: true,
          ownerProfile: profile,
          isVehicleTag: profile.isVehicleTag,
          token: profile.token,
        });
      },

      logoutOwner: () => {
        set({
          isAuthenticated: false,
          ownerProfile: null,
          isVehicleTag: false,
          token: null,
        });
      },

      setIsVehicleTag: (value) => {
        set({ isVehicleTag: value });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => mmkvStorageAdapter),
    }
  )
);
