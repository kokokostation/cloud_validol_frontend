import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit';

import {adminSeriesApi} from '../services/series/api';
import {atomsApi} from '../services/atoms/api';
import atomListSliceReducer from '../features/atom_list/atomListSlice';

export const store = configureStore({
    reducer: {
        [atomsApi.reducerPath]: atomsApi.reducer,
        [adminSeriesApi.reducerPath]: adminSeriesApi.reducer,
        datasets: atomListSliceReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(adminSeriesApi.middleware, atomsApi.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
    RootState,
    unknown,
    Action<string>>;
