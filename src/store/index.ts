import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import bankingReducer from "./slices/bankingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    banking: bankingReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
