import { useEffect, useState } from "react";
import { Moon, Plus, Sun } from "lucide-react";
import "./App.css";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

function App() {
  const [isDark, setIsDark] = useState(true);

  // shadcn's dark tokens are scoped to a `.dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const holdings = [
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
    {
      ticker: "TICK",
      price: "$10",
    },
  ];
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setIsDark((prev) => !prev)}
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
      hello
      <Button>Buy</Button>
      <Button variant="outline">Watchlist</Button>
      <Button variant="destructive">Sell</Button>
      <Button variant="ghost" size="sm">
        Details
      </Button>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
      <div style={{ width: 500, padding: "2rem" }}>
        {" "}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h) => (
              <TableRow key={h.ticker}>
                <TableCell>{h.ticker}</TableCell>
                <TableCell className="text-right">${h.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default App;
