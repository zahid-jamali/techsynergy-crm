import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

function toQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    q.set(key, String(value));
  });
  return q.toString();
}

export function usePagedList(path, extraFilters = {}) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState("false");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    hasMore: false,
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const filterKey = useMemo(() => JSON.stringify(extraFilters), [extraFilters]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, archived, limit, filterKey]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const filters = JSON.parse(filterKey);
      const qs = toQuery({ search, archived, page, limit, ...filters });
      const data = await api(`${path}?${qs}`);
      setItems(data.data || []);
      setPagination(
        data.pagination || {
          total: data.total || 0,
          page: data.page || page,
          pages: 1,
          hasMore: Boolean(data.hasMore),
        }
      );
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [path, search, archived, page, limit, filterKey]);

  useEffect(() => {
    fetchList();
  }, [fetchList, reloadKey]);

  return {
    items,
    loading,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    searchInput,
    setSearchInput,
    archived,
    setArchived,
    reload: () => setReloadKey((key) => key + 1),
  };
}
