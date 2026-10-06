import { cn } from "cn";
import { memo } from "react";
import { selectQuoteBySymbol } from "../../../features/prices/pricesSlice";
import type { WatchlistRow } from "../../../features/watchlist/selectors";
import { useAppSelector } from "../../../hooks";
import { TableCell, TableRow } from "../../ui/table";

const priceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// memo + reading only this symbol's quote means a tick re-renders just this row
const PriceRow = memo(({ symbol, name }: WatchlistRow) => {
  const quote = useAppSelector((state) => selectQuoteBySymbol(state, symbol));

  console.log("[flow 9] UI: PriceRow re-rendered", symbol, quote?.price, quote);

  const direction =
    quote?.prevPrice == null || quote.price === quote.prevPrice
      ? null
      : quote.price > quote.prevPrice
        ? "up"
        : "down";

  return (
    <TableRow>
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
        {quote ? priceFormat.format(quote.price) : "—"}
      </TableCell>
    </TableRow>
  );
});

export default PriceRow;
