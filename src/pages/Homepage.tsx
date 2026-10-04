import WatchList from "../components/feature/watchlist/WatchList";
import ContentLayout from "../components/ui/common/ContentLayout";
import { Moon, Plus, Sun } from "lucide-react";
import { Button } from "../components/ui/button";

const HomePage = () => {
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
