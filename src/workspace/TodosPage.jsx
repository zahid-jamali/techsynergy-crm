import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";

const STATUS = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

const PRIORITY = {
  low: "bg-gray-100 text-bodyText",
  medium: "bg-amber-50 text-amber-800",
  high: "bg-red-50 text-red-700",
};

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    notes: "",
    priority: "medium",
    dueDate: "",
  });

  const load = useCallback(async () => {
    const data = await api("workspace/todos");
    setTodos(data.data || []);
  }, []);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  const visible = useMemo(() => {
    if (filter === "all") return todos;
    return todos.filter((t) => t.status === filter);
  }, [todos, filter]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError("");
    try {
      await api("workspace/todos", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ title: "", notes: "", priority: "medium", dueDate: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const patch = async (todo, body) => {
    await api(`workspace/todos/${todo._id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    await load();
  };

  const remove = async (todo) => {
    await api(`workspace/todos/${todo._id}`, { method: "DELETE" });
    await load();
  };

  const counts = {
    all: todos.length,
    open: todos.filter((t) => t.status === "open").length,
    in_progress: todos.filter((t) => t.status === "in_progress").length,
    done: todos.filter((t) => t.status === "done").length,
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">To-dos</h1>
        <p className="page-subtitle">
          Track personal work, follow-ups and deadlines
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={add} className="card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="input md:col-span-2"
          placeholder="Add a task..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <select
          className="input"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <button className="btn-primary shrink-0">
            <Plus size={16} />
            Add
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {[{ key: "all", label: "All" }, ...STATUS].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === tab.key
                ? "bg-brand text-white"
                : "bg-card border border-gray-200 text-bodyText"
            }`}
          >
            {tab.label} ({counts[tab.key] || 0})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="card p-8 text-center text-bodyText">
            No tasks in this view.
          </div>
        ) : (
          visible.map((todo) => (
            <div
              key={todo._id}
              className="card p-4 flex flex-col md:flex-row md:items-center gap-3"
            >
              <input
                type="checkbox"
                checked={todo.status === "done"}
                onChange={() =>
                  patch(todo, {
                    status: todo.status === "done" ? "open" : "done",
                  })
                }
                className="w-4 h-4 accent-[#021d54]"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium ${
                    todo.status === "done"
                      ? "line-through text-bodyText"
                      : "text-heading"
                  }`}
                >
                  {todo.title}
                </p>
                {todo.notes && (
                  <p className="text-xs text-bodyText mt-0.5">{todo.notes}</p>
                )}
              </div>
              <span
                className={`badge ${PRIORITY[todo.priority] || PRIORITY.medium}`}
              >
                {todo.priority}
              </span>
              <span className="text-xs text-bodyText w-28">
                {todo.dueDate
                  ? new Date(todo.dueDate).toLocaleDateString()
                  : "No due date"}
              </span>
              <select
                className="input w-36 py-1.5"
                value={todo.status}
                onChange={(e) => patch(todo, { status: e.target.value })}
              >
                {STATUS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => remove(todo)}
                className="text-bodyText hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
