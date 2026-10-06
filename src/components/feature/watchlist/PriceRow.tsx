import { cn } from "cn";
import { CircleMinus } from "lucide-react";
import { memo } from "react";
import { selectQuoteBySymbol } from "../../../features/prices/pricesSlice";
import type { WatchlistRow } from "../../../features/watchlist/selectors";
import { useAppSelector } from "../../../hooks";
import { Button } from "../../ui/button";
import { TableCell, TableRow } from "../../ui/table";

interface PriceRowProps {
  editMode: boolean;
  watchlistRow: WatchlistRow
  handleRemoveTicker: (symbol: string) => void;
}

const priceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


// memo + reading only this symbol's quote means a tick re-renders just this row
const PriceRow = memo(({ editMode, watchlistRow, handleRemoveTicker }: PriceRowProps) => {
  const { symbol, name, lastPrice } = watchlistRow

  const quote = useAppSelector((state) => selectQuoteBySymbol(state, symbol));

  const price = quote?.price ?? lastPrice;

  console.log("[flow 9] UI: PriceRow re-rendered", symbol, quote?.price, quote);

  const direction =
    quote?.prevPrice == null || quote.price === quote.prevPrice
      ? null
      : quote.price > quote.prevPrice
        ? "up"
        : "down";

  return (
    <TableRow >
      <TableCell>
        <div className="font-medium">{symbol}</div>
        <div className="text-muted-foreground text-xs">{name}</div>
      </TableCell>
      <TableCell
        className={cn(
          "text-right tabular-nums",
          direction === "up" && "text-green-500",
          direction === "down" && "text-red-500",
        )}
      >
        {price != null ? priceFormat.format(price) : "—"}
      </TableCell>
      {editMode &&
        <TableCell className="text-right w-10">
          <Button variant={"ghost"} size={"icon"} aria-label="remove button" onClick={() => {
            handleRemoveTicker(symbol)
          }}>
            <CircleMinus className="text-red-500" />
          </Button>
        </TableCell>
      }

    </TableRow>
  );
});

export default PriceRow;
