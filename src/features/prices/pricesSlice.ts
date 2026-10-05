import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Quote } from "../../types";
import type { RootState } from "../../store";

const pricesAdapter = createEntityAdapter({
  selectId: (q: Quote) => q.symbol,
});

const pricesSlice = createSlice({
  name: "prices",
  initialState: pricesAdapter.getInitialState(),
  reducers: {
    pricesUpdated(state, action: PayloadAction<Omit<Quote, "prevPrice">[]>) {
      const updates = action.payload.map((tick) => ({
        ...tick,
        prevPrice: state.entities[tick.symbol]?.price ?? null,
      }));
      pricesAdapter.upsertMany(state, updates);
    },
    pricesCleared(state) {
      pricesAdapter.removeAll(state);
    },
  },
});

export const { pricesUpdated, pricesCleared } = pricesSlice.actions;
export default pricesSlice.reducer;

export const { selectById: selectQuoteBySymbol, selectAll: selectAllQuotes } =
  pricesAdapter.getSelectors((state: RootState) => state.prices);
