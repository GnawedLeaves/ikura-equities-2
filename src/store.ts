//root reducer and store

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import watchListReducer from "./features/watchlist/watchlistSlice";
import pricesReducer from "./features/prices/pricesSlice";
import instrumentReducer from "./features/instruments/instrumentsSlice";

const rootReducer = combineReducers({
  watchlist: watchListReducer,
  prices: pricesReducer,
  instruments: instrumentReducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
