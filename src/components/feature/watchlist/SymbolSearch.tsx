import { useEffect, useState, type FormEvent } from "react";
import { instrumentAdded } from "../../../features/instruments/instrumentsSlice";
import { symbolAdded } from "../../../features/watchlist/watchlistSlice";
import { useAppDispatch, useAppSelector, useDebounce } from "../../../hooks";
import type { SearchResult } from "../../../types";
import { Field, FieldDescription, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";

// results remember which query they belong to, so Enter never acts on stale results
interface Results {
  query: string;
  items: SearchResult[];
}

const SymbolSearch = () => {
  const dispatch = useAppDispatch();
  const watched = useAppSelector((state) => state.watchlist.symbols);

  const [input, setInput] = useState("");
  const [results, setResults] = useState<Results>({ query: "", items: [] });
  const [message, setMessage] = useState<string | null>(null);

  const typed = input.trim();
  const query = useDebounce(typed, 300);
  const isSearching = typed !== "" && results.query !== typed;

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SearchResult[]>;
      })
      .then((items) => {
        setResults({ query, items });
        setMessage(null);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setMessage("Search failed, try again");
      });

    // a newer query cancels the older request, so slow responses can't overwrite newer ones
    return () => controller.abort();
  }, [query]);

  // only symbols that came back from Finnhub's search can reach the watchlist
  const add = (item: SearchResult) => {
    console.log("[flow 1] UI: user added", item.symbol, "-> dispatch symbolAdded");
    dispatch(instrumentAdded({ symbol: item.symbol, name: item.name, prevClose: null }));
    dispatch(symbolAdded(item.symbol));
    setInput("");
    setMessage(null);
  };

  // Enter adds the result whose ticker exactly matches what was typed, e.g. "AAPL"
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!typed) return;
    if (isSearching) {
      setMessage("Still searching…");
      return;
    }
    const match = results.items.find(
      (item) => item.symbol.toUpperCase() === typed.toUpperCase(),
    );
    if (match) add(match);
    else setMessage(`"${typed}" isn't a valid ticker. Pick one from the list.`);
  };

  const showList = typed !== "" && results.query !== "";

  return (
    <form onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor="symbol-search">Add a stock</FieldLabel>
        <Input
          id="symbol-search"
          placeholder="Search by ticker or name, e.g. AAPL or apple"
          autoComplete="off"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setMessage(null);
          }}
        />

        {showList && (
          <ul className="max-h-64 divide-y overflow-auto rounded-md border">
            {isSearching && (
              <li className="text-muted-foreground px-3 py-2 text-sm">Searching…</li>
            )}
            {!isSearching && results.items.length === 0 && (
              <li className="text-muted-foreground px-3 py-2 text-sm">No matches</li>
            )}
            {results.items.map((item) => {
              const added = watched.includes(item.symbol);
              return (
                <li key={item.symbol}>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => add(item)}
                    className="hover:bg-muted flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm disabled:opacity-50"
                  >
                    <span>
                      <span className="font-medium">{item.symbol}</span>{" "}
                      <span className="text-muted-foreground">{item.name}</span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {added ? "Added" : item.type}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <FieldDescription>
          {message ?? "Click a result, or press Enter on an exact ticker"}
        </FieldDescription>
      </Field>
    </form>
  );
};

export default SymbolSearch;
