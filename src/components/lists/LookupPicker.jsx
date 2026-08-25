import { useEffect, useMemo, useRef, useState } from "react";
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
  const [menuStyle, setMenuStyle] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    setQuery(displayValue || "");
  }, [displayValue]);

  const paramKey = useMemo(() => JSON.stringify(extraParams), [extraParams]);

  useEffect(() => {
    if (!open || disabled) return undefined;
    const place = () => {
      const el = boxRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const maxHeight = Math.min(224, Math.max(120, spaceBelow - 12));
      const top =
        spaceBelow < 140 && rect.top > spaceBelow
          ? Math.max(8, rect.top - maxHeight - 4)
          : rect.bottom + 4;
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        top,
        width: rect.width,
        maxHeight,
        zIndex: 80,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, disabled, items.length]);

  useEffect(() => {
    if (!open || disabled) return undefined;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: query.trim(),
          limit: "40",
        });
        Object.entries(JSON.parse(paramKey) || {}).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            params.set(key, String(val));
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
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open, endpoint, paramKey, disabled]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={boxRef}>
      {label && <label className="label">{label}</label>}
      <input
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => !disabled && setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onSelect(null);
        }}
        className="input w-full bg-card border border-gray-200 px-3 py-2 rounded-lg disabled:opacity-50"
      />
      {open && !disabled && menuStyle && (
        <div
          className="bg-card border border-gray-200 rounded-lg overflow-y-auto shadow-lg"
          style={menuStyle}
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-bodyText">Searching...</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-bodyText">No matches</div>
          )}
          {items.map((item) => (
            <button
              type="button"
              key={item._id}
              className="w-full text-left px-3 py-2 hover:bg-surface border-b border-gray-100 last:border-0"
              onMouseDown={(e) => e.preventDefault()}
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
