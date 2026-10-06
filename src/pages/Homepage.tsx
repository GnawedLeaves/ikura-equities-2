import { useEffect } from "react";
import SymbolSearch from "../components/feature/watchlist/SymbolSearch";
import WatchList from "../components/feature/watchlist/WatchList";
import ContentLayout from "../components/ui/common/ContentLayout";
import { fetchInstruments } from "../features/instruments/instrumentsSlice";
import { useAppDispatch } from "../hooks";
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
    <ContentLayout >
      <SymbolSearch />
      <WatchList />

    </ContentLayout>
  );
};

export default HomePage;
