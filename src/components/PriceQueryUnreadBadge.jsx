import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

export default function PriceQueryUnreadBadge({ compact = false }) {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await api("price-queries/unread");
      setCount(Number(data.count) || 0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    const onRead = () => load();
    window.addEventListener("price-query-read", onRead);
    window.addEventListener("focus", onRead);
    return () => {
      clearInterval(timer);
      window.removeEventListener("price-query-read", onRead);
      window.removeEventListener("focus", onRead);
    };
  }, [load]);

  if (!count) return null;

  if (compact) {
    return (
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
    );
  }

  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}
