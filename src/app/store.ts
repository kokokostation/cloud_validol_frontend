import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import {adminSeriesApi} from "../services/series/api";

export const store = configureStore({
    reducer: {
        [adminSeriesApi.reducerPath]: adminSeriesApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(adminSeriesApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
