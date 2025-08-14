// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getItem, setItem } from '../../uikit/UikitUtils/mmkvStorage';

interface AuthState {
  isLoggedIn: boolean;
  isRiderLoggedIn: boolean; 
    isLoginCount: boolean; // ✅ New boolean state// Added state for rider login
}

const initialState: AuthState = {
  isLoggedIn: getItem('isLoggedIn') === 'true',
  isRiderLoggedIn: getItem('isRiderlogin') === 'true', // Retrieve rider login status from MMKV
isLoginCount: true, 
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
      setItem('isLoggedIn', 'true'); // Persist to MMKV
    },
    logout: (state) => {
      state.isLoggedIn = false;
      setItem('isLoggedIn', 'false'); // Persist to MMKV
    },
    riderlogin: (state) => {
      state.isRiderLoggedIn = true; // Update rider login state
      setItem('isRiderlogin', 'true'); // Persist to MMKV
    },
    riderlogout: (state) => {
      state.isRiderLoggedIn = false; // Update rider logout state
      setItem('isRiderlogin', 'false'); // Persist to MMKV
    },
    setLoginState: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
      setItem('isLoggedIn', action.payload ? 'true' : 'false'); // Persist to MMKV
    },
    setRiderLoginState: (state, action: PayloadAction<boolean>) => { // Added for setting rider login state
      state.isRiderLoggedIn = action.payload;
      setItem('isRiderlogin', action.payload ? 'true' : 'false'); // Persist to MMKV
    },
     setLoginCount: (state, action: PayloadAction<boolean>) => {
      state.isLoginCount = action.payload; // ✅ No MMKV persistence
    },
  },
});

export const {
  login,
  logout,
  setLoginState,
  riderlogin,
  riderlogout,
  setRiderLoginState,
    setLoginCount, // ✅ Exported action

} = authSlice.actions;

export default authSlice.reducer;

export const getServiceNotificationReducer = createSlice({
  name: 'service',
  initialState: {
    isModalOpen: false,
    closeModal: false,
    message: '',
  },
  reducers: {
    setServiceDetail: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setServiceDetail } = getServiceNotificationReducer.actions;
