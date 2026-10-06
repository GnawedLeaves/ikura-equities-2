import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

import { BrowserRouter, Route, Routes, } from "react-router";
import HomePage from "./pages/Homepage";

function App() {
  const [isDark, setIsDark] = useState(true);

  // shadcn's dark tokens are scoped to a `.dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <BrowserRouter>
      <div className="absolute right-4 top-4 ">
        <Button
          variant="outline"
          size="icon"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setIsDark((prev) => !prev)}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </div>
      <Routes>
        <Route path="/*" element={<HomePage />} />
        {/* <Route element={<RequireAuth />}>
          <Route path="/" element={<WatchlistPage />} />
          <Route path="/symbol/:symbol" element={<SymbolDetailPage />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
