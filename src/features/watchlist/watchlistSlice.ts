//slice creation
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface WatchlistState {
  symbols: string[];
  selected: string | null;
}

//1. inital state
const initialState: WatchlistState = { symbols: ["TEST"], selected: null };

//2. slice creation
const watchListSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    //if the state already contains this ticker then skip
    // action contains something like this, its just a message actually: action = { type: 'watchlist/symbolAdded', payload: 'MSFT' }
    // state contains what is currently in the store
    symbolAdded(state, action: PayloadAction<string>) {
      if (!state.symbols.includes(action.payload)) {
        state.symbols.push(action.payload);
      }
    },
    symbolRemoved(state, action: PayloadAction<string>) {
      if (state.symbols.includes(action.payload)) {
        state.symbols = state.symbols.filter(
          (symbol) => symbol !== action.payload,
        );
      }
      if (state.selected !== action.payload) state.selected = null;
    },
    symbolSelected(state, action: PayloadAction<string | null>) {
      state.selected = action.payload;
    },
  },
});

export const { symbolAdded, symbolRemoved, symbolSelected } =
  watchListSlice.actions;
export default watchListSlice.reducer;
