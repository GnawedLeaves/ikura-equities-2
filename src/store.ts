//root reducer and store

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import watchListReducer from "./features/watchlist/watchlistSlice";

const rootReducer = combineReducers({
  watchList: watchListReducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
