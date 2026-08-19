import { useCallback, useEffect, useMemo, useState } from "react";
import { Globe, Lock, Plus, Pin, Trash2 } from "lucide-react";
import { api } from "../lib/api";

const TABS = [
  { key: "all", label: "All" },
  { key: "mine", label: "My notes" },
  { key: "private", label: "Private" },
  { key: "public", label: "Team / public" },
];

export default function NotebooksPage() {
  const [notes, setNotes] = useState([]);
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [current, setCurrent] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadList = useCallback(async () => {
    const data = await api(`workspace/notebooks?scope=${scope}`);
    setNotes(data.data || []);
  }, [scope]);

  const openNote = useCallback(async (id) => {
    const data = await api(`workspace/notebooks/${id}`);
    setCurrent(data.data);
    setCanEdit(Boolean(data.canEdit));
    setActiveId(id);
  }, []);

  useEffect(() => {
    loadList().catch((err) => setError(err.message));
  }, [loadList]);

  useEffect(() => {
    if (!activeId && notes[0]?._id) {
      openNote(notes[0]._id).catch(() => {});
    }
  }, [notes, activeId, openNote]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(q));
  }, [notes, search]);

  const createNote = async () => {
    const data = await api("workspace/notebooks", {
      method: "POST",
      body: JSON.stringify({ title: "Untitled note", visibility: "private" }),
    });
    await loadList();
    await openNote(data.data._id);
  };

  const save = async (patch) => {
    if (!current || !canEdit) return;
    setSaving(true);
    setError("");
    try {
      const data = await api(`workspace/notebooks/${current._id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setCurrent(data.data);
      await loadList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!current || !canEdit) return;
    await api(`workspace/notebooks/${current._id}`, { method: "DELETE" });
    setCurrent(null);
    setActiveId(null);
    await loadList();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notebooks</h1>
          <p className="page-subtitle">
            Private notes stay with you. Public notes are visible to the team.
          </p>
        </div>
        <button className="btn-primary" onClick={createNote}>
          <Plus size={16} />
          New note
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-[70vh]">
        <aside className="card p-4 flex flex-col">
          <input
            className="input mb-3"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setScope(tab.key);
                  setActiveId(null);
                }}
                className={`px-2.5 py-1 rounded-md text-xs ${
                  scope === tab.key
                    ? "bg-brand text-white"
                    : "bg-surface text-bodyText"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {filtered.length === 0 && (
              <p className="text-sm text-bodyText px-1">No notes found.</p>
            )}
            {filtered.map((note) => (
              <button
                key={note._id}
                onClick={() => openNote(note._id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 ${
                  activeId === note._id
                    ? "bg-brand/10 text-heading"
                    : "hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{note.title}</span>
                  {note.visibility === "public" ? (
                    <Globe size={12} className="text-brand shrink-0" />
                  ) : (
                    <Lock size={12} className="text-bodyText shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-bodyText mt-0.5">
                  {note.createdBy?.name || "You"} ·{" "}
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="card p-0 overflow-hidden flex flex-col">
          {!current ? (
            <div className="flex-1 flex items-center justify-center text-bodyText">
              Select or create a note
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                <input
                  className="flex-1 min-w-[180px] text-lg font-semibold bg-transparent outline-none text-heading"
                  value={current.title}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setCurrent({ ...current, title: e.target.value })
                  }
                  onBlur={() => save({ title: current.title })}
                />
                {canEdit && (
                  <>
                    <button
                      className="btn-secondary text-xs"
                      onClick={() =>
                        save({
                          visibility:
                            current.visibility === "public"
                              ? "private"
                              : "public",
                        })
                      }
                    >
                      {current.visibility === "public" ? (
                        <>
                          <Globe size={14} /> Public
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> Private
                        </>
                      )}
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => save({ pinned: !current.pinned })}
                      title="Pin"
                    >
                      <Pin
                        size={16}
                        className={current.pinned ? "text-brand" : ""}
                      />
                    </button>
                    <button className="btn-ghost text-red-600" onClick={remove}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <div className="px-5 py-2 text-xs text-bodyText border-b border-gray-50 flex justify-between">
                <span>
                  {current.visibility === "public"
                    ? "Visible to the whole team"
                    : "Only you can see this note"}
                  {!canEdit && ` · by ${current.createdBy?.name || "a teammate"}`}
                </span>
                <span>{saving ? "Saving..." : "Saved"}</span>
              </div>
              <textarea
                className="flex-1 w-full p-5 outline-none resize-none text-heading leading-7"
                placeholder="Start writing..."
                disabled={!canEdit}
                value={current.content || ""}
                onChange={(e) =>
                  setCurrent({ ...current, content: e.target.value })
                }
                onBlur={() => save({ content: current.content })}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
