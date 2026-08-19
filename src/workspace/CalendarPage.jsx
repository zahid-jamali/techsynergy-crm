import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const COLORS = {
  brand: "bg-brand text-white",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-white",
  violet: "bg-violet-600 text-white",
  sky: "bg-sky-600 text-white",
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildGrid = (cursor) => {
  const first = startOfMonth(cursor);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0
  ).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const toInputDate = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: toInputDate(new Date()),
    color: "brand",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59);
    const data = await api(
      `workspace/calendar?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    setEvents(data.data || []);
  }, [cursor]);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  const cells = useMemo(() => buildGrid(cursor), [cursor]);
  const selectedEvents = events.filter((event) =>
    sameDay(new Date(event.start), selected)
  );

  const openCreate = (day) => {
    setSelected(day);
    setEditing(null);
    setForm({
      title: "",
      description: "",
      start: toInputDate(day),
      color: "brand",
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        start: new Date(form.start),
        allDay: true,
        color: form.color,
      };
      if (editing) {
        await api(`workspace/calendar/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("workspace/calendar", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await api(`workspace/calendar/${id}`, { method: "DELETE" });
    setShowForm(false);
    await load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">
            Plan meetings, follow-ups and personal reminders
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => openCreate(selected || new Date())}
        >
          <Plus size={16} />
          New event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              className="btn-ghost"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                )
              }
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-heading">
              {cursor.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              className="btn-ghost"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                )
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-xs font-semibold text-bodyText mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-1 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const dayEvents = day
                ? events.filter((event) => sameDay(new Date(event.start), day))
                : [];
              const isToday = day && sameDay(day, new Date());
              const isSelected = day && sameDay(day, selected);
              return (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelected(day)}
                  onDoubleClick={() => day && openCreate(day)}
                  className={`min-h-[92px] rounded-lg border p-2 text-left transition ${
                    !day
                      ? "border-transparent"
                      : isSelected
                      ? "border-brand bg-brand/5"
                      : "border-gray-100 bg-card hover:border-brand/30"
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs ${
                          isToday
                            ? "bg-brand text-white"
                            : "text-heading"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event._id}
                            className={`truncate px-1.5 py-0.5 rounded text-[10px] ${
                              COLORS[event.color] || COLORS.brand
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[10px] text-bodyText">
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-heading mb-1">
            {selected?.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-xs text-bodyText mb-4">
            Double-click a day to add an event
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-bodyText">No events on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div
                  key={event._id}
                  className="border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-heading">{event.title}</p>
                    <button
                      className="text-bodyText hover:text-brand"
                      onClick={() => {
                        setEditing(event);
                        setForm({
                          title: event.title,
                          description: event.description || "",
                          start: toInputDate(event.start),
                          color: event.color || "brand",
                        });
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  {event.description && (
                    <p className="text-xs text-bodyText mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <form onSubmit={save} className="modal-panel max-w-md p-6 space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit event" : "New event"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                required
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Color</label>
              <select
                className="input"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              >
                <option value="brand">Navy</option>
                <option value="emerald">Green</option>
                <option value="amber">Amber</option>
                <option value="violet">Violet</option>
                <option value="sky">Sky</option>
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-between pt-2">
              {editing ? (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => remove(editing._id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary">Save</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
