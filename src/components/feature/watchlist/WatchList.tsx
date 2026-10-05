import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  TableHeader,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableBody,
} from "../../ui/table";
import { Input } from "../../ui/input";
import { Field, FieldLabel, FieldDescription } from "../../ui/field";
import { Button } from "../../ui/button";
import { symbolAdded } from "../../../features/watchlist/watchlistSlice";
import { fetchInstruments } from "../../../features/instruments/instrumentsSlice";

const WatchList = () => {
  //using the redux store etc
  const dispatch = useAppDispatch();
  const symbols = useAppSelector((state) => state.watchlist.symbols);

  const [input, setInput] = useState<string>("");
  const handleAddSymbol = () => {
    const symbol = input.trim().toUpperCase();
    if (symbol) {
      dispatch(symbolAdded(symbol));
      setInput("");
    }
  };
  useEffect(() => {
    const request = dispatch(fetchInstruments()); // starts the fetch
    return () => request.abort();
  }, [dispatch]);

  return (
    <div style={{ width: 500 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSymbol();
        }}
      >
        <Field>
          <FieldLabel htmlFor="new-symbol-input">New Symbol</FieldLabel>

          <div style={{ display: "flex", gap: 4 }}>
            <Input
              id="new-symbol-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
            />
            <Button type="submit">Add</Button>
          </div>

          <FieldDescription>
            Enter a ticker and select from the dropdown
          </FieldDescription>
        </Field>
      </form>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              {/* <TableHead className="text-right">Price</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {symbols.map((h) => (
              <TableRow key={h}>
                <TableCell>{h}</TableCell>
                {/* <TableCell className="text-right">${h.price}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WatchList;
