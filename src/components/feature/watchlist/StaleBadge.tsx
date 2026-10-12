import { useEffect, useState } from "react";
import { Badge } from "../../ui/badge";


const STALE_MS = 5000;
const StaleBadge = ({ receivedAt }: { receivedAt?: number }) => {

  const [dateNow, setDateNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setDateNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (receivedAt == null) return <Badge variant="secondary">Waiting</Badge>;
  const stale = dateNow - receivedAt > STALE_MS;
  return <Badge variant={stale ? "destructive" : "default"}>{stale ? "Stale" : "Live"}</Badge>;



}

export default StaleBadge