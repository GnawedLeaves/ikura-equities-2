import { Plus } from "lucide-react";
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
