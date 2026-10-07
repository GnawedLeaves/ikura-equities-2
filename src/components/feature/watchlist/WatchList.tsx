import { useCallback, useState } from "react";
import { selectWatchlistRows } from "../../../features/watchlist/selectors";
import { symbolRemoved } from "../../../features/watchlist/watchlistSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import CandleChart from "./CandleChart";
import PriceRow from "./PriceRow";


const WatchList = () => {
  //using the redux store etc
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectWatchlistRows);
  const selected = useAppSelector((state) => state.watchlist.selected);
  const [editMode, setEditMode] = useState<boolean>(false)

  const [itemsToBeRemoved, setItemsToBeRemoved] = useState<string[]>([])

  const handleRealRemove = () => {
    itemsToBeRemoved.forEach((symbol) => {
      dispatch(symbolRemoved(symbol))
    })
    setItemsToBeRemoved([])
    setEditMode(false)
  }

  const handleCancel = () => {
    setItemsToBeRemoved([])
    setEditMode(false)
  }

  const handleRemoveVisualTicker = useCallback((symbol: string) => {
    setItemsToBeRemoved((prev) => [...prev, symbol])
  }, [])

  const displayRows = rows.filter((row) => !itemsToBeRemoved.includes(row.symbol))

  return (
    <div style={{ width: 600 }}>
      <div className="flex justify-between mt-8 mb-2">
        <div className="text-2xl">Watchlist</div>
        {editMode ?
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={() => {
              handleRealRemove()
            }}>Save changes</Button>

          </div>
          :
          <Button onClick={() => setEditMode(true)}>Edit</Button>
        }
      </div>
      <div >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Price</TableHead>
              {editMode && <TableHead className="text-right">Action</TableHead>
              }
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row) => (
              <PriceRow key={row.symbol} watchlistRow={row} editMode={editMode} handleRemoveTicker={handleRemoveVisualTicker} />
            ))}
          </TableBody>
        </Table>
      </div>
      {selected && <CandleChart symbol={selected} />}
    </div>
  );
};

export default WatchList;
