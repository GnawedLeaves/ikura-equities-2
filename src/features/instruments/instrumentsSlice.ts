import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Instrument } from "../../types";

//instruments gets the details of the symbols that watchlist stores
export interface InstrumentsState {
  items: Instrument[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: InstrumentsState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchInstruments = createAsyncThunk<
  Instrument[], // returned on success → action.payload in `fulfilled`
  void, // argument: dispatch(fetchInstruments()) takes none
  { rejectValue: string } // type of action.payload in `rejected`
>("instruments/fetch", async (_arg, { rejectWithValue, signal }) => {
  try {
    const res = await fetch("/api/instruments", { signal });
    if (!res.ok) return rejectWithValue(`HTTP ${res.status}`);
    return (await res.json()) as Instrument[];
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return rejectWithValue("Network error");
  }
});

//will just listen for the statuses coming from the fetchInstruments and update the state accordingly
// the state is like the items, error etc defined in initial state
// to trigger a call , just call dispatch(fetchInstruments) in our component
const instrumentSlice = createSlice({
  name: "instruments",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstruments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInstruments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchInstruments.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Unknown Error while fetching instruments";
      });
  },
});

export default instrumentSlice.reducer;
