import { create } from "zustand";
import { mmkvStorageAdapter } from "../utils/mmkvStorage";
import { createJSONStorage, persist } from "zustand/middleware";
import { OwnerListItem } from "../services/api";

export interface UserProfile {
  id: number;
  username: string;
  profilepic: string;
  mobileno: string;
  token: string;
  isVehicleTag?: boolean;
  // New Admin-specific fields
  isSuperAdmin?: boolean;
  locationID?: number;
  countryID?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  isVehicleTag: boolean;
  userProfile: UserProfile | null;
  userRole: "owner" | "admin" | null;
  token: string | null;
  managedOwnerProfile: OwnerListItem | null;
  loginUser: (profile: UserProfile, role: "owner" | "admin") => void;
  logoutUser: () => void;
  setIsVehicleTag: (value: boolean) => void;
  setManagedOwner: (owner: Owner | null) => void;
}

export const useActiveOwnerId = () => {
  const { userRole, userProfile, managedOwnerProfile } = useAuthStore();
  if (userRole === "owner") {
    return userProfile?.id;
  }

  return managedOwnerProfile?.ownerID;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isVehicleTag: false,
      userProfile: null,
      userRole: null,
      token: null,
      managedOwnerProfile: null,

      loginUser: (profile, role) => {
        set({
          isAuthenticated: true,
          userProfile: profile,
          userRole: role,
          token: profile.token,
          isVehicleTag: profile.isVehicleTag,
        });
      },

      logoutUser: () => {
        set({
          isAuthenticated: false,
          userProfile: null,
          userRole: null,
          token: null,
        });
      },

      setIsVehicleTag: (value) => {
        set({ isVehicleTag: value });
      },
      setManagedOwner: (owner) => {
        set({ managedOwnerProfile: owner });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => mmkvStorageAdapter),
    }
  )
);
