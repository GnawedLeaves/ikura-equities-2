import WatchList from "../components/feature/watchlist/WatchList";
import ContentLayout from "../components/ui/common/ContentLayout";
import { Moon, Plus, Sun } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAppDispatch } from "../hooks";
import { useEffect } from "react";
import { fetchInstruments } from "../features/instruments/instrumentsSlice";
import { socketConnection, socketDisconnect } from "../socketMiddleware";

const HomePage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const request = dispatch(fetchInstruments());
    dispatch(socketConnection({ url: "ws://localhost:3001" }));

    // when unmount do these actions
    return () => {
      request.abort();
      dispatch(socketDisconnect());
    };
  }, [dispatch]);
  return (
    <ContentLayout>
      <div>
        hello
        <Button>Buy</Button>
        <Button variant="outline">Watchlist</Button>
        <Button variant="destructive">Sell</Button>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </div>

      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
      <WatchList />
    </ContentLayout>
  );
};

export default HomePage;
