import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

export default function LookupPicker({
  label,
  endpoint,
  extraParams = {},
  value,
  displayValue,
  placeholder = "Search...",
  onSelect,
  renderItem,
  disabled = false,
}) {
  const [query, setQuery] = useState(displayValue || "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(displayValue || "");
  }, [displayValue]);

  const paramKey = useMemo(() => JSON.stringify(extraParams), [extraParams]);

  useEffect(() => {
    if (!open || disabled) return undefined;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: query.trim(),
          limit: "20",
        });
        Object.entries(JSON.parse(paramKey) || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
          }
        });
        const data = await api(`${endpoint}?${params.toString()}`);
        setItems(data.data || []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open, endpoint, paramKey, disabled]);

  return (
    <div className="relative">
      {label && <label className="label">{label}</label>}
      <input
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => !disabled && setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onSelect(null);
        }}
        className="input w-full bg-card border border-gray-200 px-3 py-2 rounded-lg disabled:opacity-50"
      />
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-gray-200 rounded-lg max-h-56 overflow-y-auto shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-bodyText">Searching...</div>}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-bodyText">No matches</div>
          )}
          {items.map((item) => (
            <button
              type="button"
              key={item._id}
              className="w-full text-left px-3 py-2 hover:bg-surface border-b border-gray-100 last:border-0"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              {renderItem ? renderItem(item) : item.name || item.accountName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
