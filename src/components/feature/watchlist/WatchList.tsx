import { useEffect } from "react";
import { fetchInstruments } from "../../../features/instruments/instrumentsSlice";
import { selectWatchlistRows } from "../../../features/watchlist/selectors";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import PriceRow from "./PriceRow";
import SymbolSearch from "./SymbolSearch";

const WatchList = () => {
  //using the redux store etc
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectWatchlistRows);

  useEffect(() => {
    const request = dispatch(fetchInstruments()); // starts the fetch
    return () => request.abort();
  }, [dispatch]);

  useEffect(() => {
    console.log("hello", { rows })

  }, [rows])

  return (
    <div style={{ width: 500 }}>
      <SymbolSearch />
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <PriceRow key={row.symbol} {...row} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WatchList;
