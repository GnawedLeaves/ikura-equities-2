import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { Instrument } from "../../types";

export interface WatchlistRow {
  symbol: string;
  name: string;
  prevClose: number | null;
}

const selectSymbols = (state: RootState) => state.watchlist.symbols;
//selectSymbols(state); → ['AAPL', 'BINANCE:BTCUSDT']
const selectInstruments = (state: RootState) => state.instruments.items;

//selectWatchlistRows joins them into the shape the table needs
export const selectWatchlistRows = createSelector(
  // every time it's called, createSelector runs both with state and checks their outputs against last time by ===. its like the dependency in useEffect
  [selectSymbols, selectInstruments],
  (symbols, instruments): WatchlistRow[] => {
    const bySymbol = new Map<string, Instrument>(
      instruments.map((i) => [i.symbol, i]),
    );
    return symbols.map((symbol) => {
      const inst = bySymbol.get(symbol);
      return {
        symbol,
        name: inst?.name ?? symbol,
        prevClose: inst?.prevClose ?? null,
      };
    });
  },
);

//If prices were joined in here, the array would be rebuilt on every tick and the whole table would re-render dozens of times a second.

//The Map makes the lookup O(1) per symbol instead of .find inside .map.

// Say AAPL ticks:
// prices changes in the store.
// selectWatchlistRows runs both input selectors. watchlist.symbols and instruments.items are the same references as before.
// createSelector skips the result function and returns the same array.
// useAppSelector sees ===, so Watchlist doesn't re-render.
// Only the AAPL PriceRow re-renders, because it reads its own quote through selectQuoteBySymbol.
