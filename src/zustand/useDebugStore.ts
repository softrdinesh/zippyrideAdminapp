import { create } from "zustand";

interface DebugState {
  isLoggerVisible: boolean;
  toggleLogger: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  isLoggerVisible: false,
  toggleLogger: () =>
    set((state) => ({ isLoggerVisible: !state.isLoggerVisible })),
}));
