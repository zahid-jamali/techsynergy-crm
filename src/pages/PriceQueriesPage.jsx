import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import LookupPicker from "../components/lists/LookupPicker";
import { getUserRole, ROLE_LABELS } from "../lib/roles";

const POLL_MS = 7000;
const MAX_FILES = 3;
const ALL_THREAD = "all";

const ROLE_TONE = {
  staff: "bg-sky-50 text-sky-800",
  operations: "bg-emerald-50 text-emerald-800",
  admin: "bg-brand/10 text-brand",
};

function isImage(file) {
  return (
    file?.resourceType === "image" ||
    String(file?.mimeType || "").startsWith("image/")
  );
}

function formatDay(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileLabel(file) {
  return file.originalName || file.url?.split("/").pop() || "Attachment";
}

function previewText(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "No messages yet";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export default function PriceQueriesPage() {
  const user = useMemo(
    () => JSON.parse(sessionStorage.getItem("user") || "{}"),
    [],
  );
  const myId = String(user._id || "");
  const myRole = String(getUserRole(user) || "").toLowerCase();
  const isInbox = myRole === "admin" || myRole === "operations";

  const [threads, setThreads] = useState([]);
  const [threadQuery, setThreadQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(
    myRole === "admin" || myRole === "operations" ? ALL_THREAD : "",
  );
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pendingNew, setPendingNew] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const scrollerRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const stickToBottom = useRef(true);
  const newestIdRef = useRef(null);
  const oldestIdRef = useRef(null);
  const selectedRef = useRef("");

  const activeThreadId = isInbox ? selectedStaffId : myId;
  selectedRef.current = activeThreadId;
  newestIdRef.current = messages[messages.length - 1]?._id || null;
  oldestIdRef.current = messages[0]?._id || null;

  const selectedThread = threads.find(
    (row) => String(row.staff?._id) === selectedStaffId,
  );

  const markRead = useCallback(async () => {
    try {
      await api("price-queries/read", {
        method: "POST",
        body: JSON.stringify({}),
      });
      window.dispatchEvent(new Event("price-query-read"));
    } catch {
      /* ignore */
    }
  }, []);

  const scrollToBottom = (smooth = false) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const messageQuery = useCallback(
    (extra = {}) => {
      const qs = new URLSearchParams(extra);
      if (isInbox && activeThreadId && activeThreadId !== ALL_THREAD) {
        qs.set("threadOwner", activeThreadId);
      }
      if (search) qs.set("search", search);
      return qs.toString();
    },
    [isInbox, activeThreadId, search],
  );

  const loadThreads = useCallback(async () => {
    if (!isInbox) return;
    try {
      const data = await api("price-queries/threads");
      const rows = data.data || [];
      setThreads(rows);
      setSelectedStaffId((current) => {
        if (current === ALL_THREAD) return ALL_THREAD;
        if (current && rows.some((row) => String(row.staff?._id) === current)) {
          return current;
        }
        return ALL_THREAD;
      });
    } catch (err) {
      setError(err.message || "Failed to load staff queries");
    }
  }, [isInbox]);

  const loadInitial = useCallback(async () => {
    if (isInbox && !activeThreadId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api(
        `price-queries/messages?${messageQuery({ limit: "40" })}`,
      );
      setMessages(data.data || []);
      setHasMore(Boolean(data.pagination?.hasMore));
      setPendingNew(0);
      stickToBottom.current = true;
      if (!search) await markRead();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isInbox, activeThreadId, messageQuery, search, markRead]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom(false);
  }, [messages, loading]);

  useEffect(() => {
    if (search) return undefined;
    const tick = async () => {
      if (document.hidden) return;
      if (isInbox) await loadThreads();
      const threadId = selectedRef.current;
      if (isInbox && !threadId) return;
      const since = newestIdRef.current;
      if (!since) {
        await loadInitial();
        return;
      }
      try {
        const qs = new URLSearchParams({ since, limit: "50" });
      if (isInbox && threadId && threadId !== ALL_THREAD) {
        qs.set("threadOwner", threadId);
      }
        const data = await api(`price-queries/messages?${qs.toString()}`);
        const incoming = data.data || [];
        if (!incoming.length) return;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m._id));
          const extra = incoming.filter((m) => !seen.has(m._id));
          return extra.length ? [...prev, ...extra] : prev;
        });
        if (stickToBottom.current) {
          await markRead();
        } else {
          setPendingNew((count) => count + incoming.length);
        }
      } catch {
        /* keep polling */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [search, isInbox, loadInitial, loadThreads, markRead]);

  const loadOlder = async () => {
    if (!hasMore || loadingOlder) return;
    const before = oldestIdRef.current;
    if (!before) return;
    setLoadingOlder(true);
    const scroller = scrollerRef.current;
    const previousHeight = scroller?.scrollHeight || 0;
    try {
      const data = await api(
        `price-queries/messages?${messageQuery({ limit: "40", before })}`,
      );
      const older = data.data || [];
      setHasMore(Boolean(data.pagination?.hasMore));
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m._id));
        return [...older.filter((m) => !seen.has(m._id)), ...prev];
      });
      requestAnimationFrame(() => {
        if (scroller) {
          scroller.scrollTop = scroller.scrollHeight - previousHeight;
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOlder(false);
    }
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickToBottom.current = nearBottom;
    if (nearBottom && pendingNew) {
      setPendingNew(0);
      markRead();
    }
  };

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    setFiles((prev) => [...prev, ...incoming].slice(0, MAX_FILES));
  };

  const send = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!body.trim() && files.length === 0) return;
    const replyOwner = String(
      replyTo?.threadOwner?._id || replyTo?.threadOwner || "",
    );
    const threadForSend =
      isInbox && activeThreadId === ALL_THREAD ? replyOwner : activeThreadId;
    if (isInbox && (!threadForSend || threadForSend === ALL_THREAD)) {
      setError("Select a staff member, or reply to a specific message");
      return;
    }
    if (!isInbox && !selectedAccount?._id) {
      setError("Search and select an account before sending a price query");
      return;
    }
    setSending(true);
    setError("");
    try {
      const form = new FormData();
      form.append("body", body.trim());
      if (isInbox) form.append("threadOwner", threadForSend);
      if (selectedAccount?._id) form.append("account", selectedAccount._id);
      if (replyTo?._id) form.append("replyTo", replyTo._id);
      files.forEach((file) => form.append("files", file));
      const data = await api("price-queries/messages", {
        method: "POST",
        body: form,
      });
      setBody("");
      setFiles([]);
      setReplyTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (data.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.data._id)) return prev;
          return [...prev, data.data];
        });
      }
      stickToBottom.current = true;
      setPendingNew(0);
      scrollToBottom(true);
      loadThreads();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const removeMessage = async (message) => {
    if (!window.confirm("Remove this message?")) return;
    try {
      await api(`price-queries/messages/${message._id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
    } catch (err) {
      setError(err.message);
    }
  };

  const grouped = useMemo(() => {
    const groups = [];
    messages.forEach((message) => {
      const day = formatDay(message.createdAt);
      const last = groups[groups.length - 1];
      if (!last || last.day !== day) {
        groups.push({ day, items: [message] });
      } else {
        last.items.push(message);
      }
    });
    return groups;
  }, [messages]);

  const visibleThreads = useMemo(() => {
    const q = threadQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((row) => {
      const name = String(row.staff?.name || "").toLowerCase();
      const email = String(row.staff?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [threads, threadQuery]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  const viewingAll = isInbox && activeThreadId === ALL_THREAD;
  const composerReady =
    (!isInbox && Boolean(selectedAccount?._id)) ||
    (isInbox && Boolean(activeThreadId) && activeThreadId !== ALL_THREAD) ||
    (isInbox && Boolean(replyTo?._id));
  const totalUnread = threads.reduce((sum, row) => sum + (Number(row.unread) || 0), 0);

  return (
    <div className="-m-6 max-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] flex bg-surface overflow-hidden">
      {isInbox && (
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-card flex flex-col min-h-0">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-heading">Staff queries</h2>
            <p className="text-[11px] text-bodyText mt-1">
              Each staff member has a private thread.
            </p>
            <input
              type="search"
              value={threadQuery}
              onChange={(e) => setThreadQuery(e.target.value)}
              placeholder="Find staff..."
              className="input mt-3 w-full bg-card border border-gray-200 px-3 py-2 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedStaffId(ALL_THREAD);
                setMessages([]);
                setSearchInput("");
                setSearch("");
                setReplyTo(null);
                stickToBottom.current = true;
              }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition ${
                viewingAll ? "bg-brand/5" : "hover:bg-surface"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-heading">
                  All queries
                </span>
                {totalUnread > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-bodyText truncate mt-0.5">
                Every staff member in one feed
              </p>
            </button>
            {visibleThreads.length === 0 && (
              <p className="px-4 py-8 text-sm text-bodyText text-center">
                No staff members found.
              </p>
            )}
            {visibleThreads.map((row) => {
              const id = String(row.staff?._id || "");
              const active = id === selectedStaffId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedStaffId(id);
                    setMessages([]);
                    setSearchInput("");
                    setSearch("");
                    setReplyTo(null);
                    stickToBottom.current = true;
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition ${
                    active ? "bg-brand/5" : "hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-heading truncate">
                      {row.staff?.name || "Staff"}
                    </span>
                    {row.unread > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                        {row.unread > 99 ? "99+" : row.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-bodyText truncate mt-0.5">
                    {previewText(row.lastBody)}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-card flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-xl font-semibold text-heading">
              {isInbox
                ? viewingAll
                  ? "All staff queries"
                  : selectedThread?.staff?.name
                    ? `${selectedThread.staff.name}'s queries`
                    : "Price Queries"
                : "Price Queries"}
            </h1>
            <p className="text-sm text-bodyText mt-0.5">
              {isInbox
                ? viewingAll
                  ? "All staff queries in one feed. Reply on a specific message, or open a person on the left."
                  : "This thread is private to this staff member. Reply normally, or tap Reply on a specific message."
                : "Search an account first, then send your query. Operations and admin can reply here."}
            </p>
          </div>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search messages..."
            className="input w-full sm:w-64 bg-card border border-gray-200 px-3 py-2 rounded-lg"
          />
        </div>

        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            className="h-full overflow-y-auto px-4 sm:px-6 py-4 space-y-6"
          >
            {hasMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={loadingOlder}
                  className="text-sm text-brand hover:underline disabled:opacity-50"
                >
                  {loadingOlder ? "Loading..." : "Load earlier messages"}
                </button>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-16 text-bodyText">
                <Loader2 className="animate-spin mr-2" size={18} />
                Loading conversation...
              </div>
            )}

            {!loading && isInbox && !activeThreadId && (
              <div className="max-w-lg mx-auto mt-16 text-center bg-card border border-gray-200 rounded-xl p-8">
                <h2 className="text-lg font-semibold text-heading">
                  Select a staff member
                </h2>
                <p className="text-sm text-bodyText mt-2">
                  Open a private thread from the left to view or reply.
                </p>
              </div>
            )}

            {!loading && (composerReady || viewingAll) && messages.length === 0 && (
              <div className="max-w-lg mx-auto mt-16 text-center bg-card border border-gray-200 rounded-xl p-8">
                <h2 className="text-lg font-semibold text-heading">
                  No price queries yet
                </h2>
                <p className="text-sm text-bodyText mt-2">
                  {viewingAll
                    ? "When staff ask for prices, every query will appear here so operations and admin can resolve it."
                    : isInbox
                      ? "Reply with vendor prices, part numbers or specs. This staff member will not see other people's threads."
                      : "Ask for vendor prices, part numbers or specs. Only you, operations and admin can see this thread."}
                </p>
              </div>
            )}

            {grouped.map((group) => (
              <div key={group.day}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium text-bodyText">
                    {group.day}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-3">
                  {group.items.map((message) => {
                    const mine =
                      String(message.sender?._id || message.sender) === myId;
                    const role =
                      message.senderRole || message.sender?.role || "staff";
                    const canDelete = mine || myRole === "admin";
                    return (
                      <div
                        key={message._id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[min(100%,36rem)] rounded-2xl border px-4 py-3 ${
                            mine
                              ? "bg-brand text-white border-brand"
                              : "bg-card text-heading border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">
                              {mine
                                ? "You"
                                : message.sender?.name || "Team member"}
                            </span>
                            <span
                              className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                                mine
                                  ? "bg-white/15 text-white"
                                  : ROLE_TONE[role] || ROLE_TONE.staff
                              }`}
                            >
                              {ROLE_LABELS[role] || role}
                            </span>
                            <span
                              className={`text-[11px] ml-auto ${mine ? "text-white/70" : "text-bodyText"}`}
                            >
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          {message.account?.accountName ? (
                            <p
                              className={`text-[11px] mb-1 ${mine ? "text-white/80" : "text-bodyText"}`}
                            >
                              Account: {message.account.accountName}
                            </p>
                          ) : null}
                          {message.replyTo ? (
                            <div
                              className={`mb-2 rounded-lg px-2.5 py-1.5 text-[11px] border-l-2 ${
                                mine
                                  ? "bg-white/10 border-white/60 text-white/85"
                                  : "bg-surface border-brand/40 text-bodyText"
                              }`}
                            >
                              <span className="font-semibold">
                                {message.replyTo.sender?.name || "Message"}
                              </span>
                              <p className="truncate mt-0.5">
                                {previewText(message.replyTo.body)}
                              </p>
                            </div>
                          ) : null}
                          {message.body ? (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.body}
                            </p>
                          ) : null}
                          {message.attachments?.length > 0 && (
                            <div className="mt-2 grid gap-2">
                              {message.attachments.map((file) =>
                                isImage(file) ? (
                                  <a
                                    key={file.url}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={file.url}
                                      alt={fileLabel(file)}
                                      className="max-h-56 rounded-lg object-cover"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    key={file.url}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`inline-flex items-center gap-2 text-sm underline ${
                                      mine ? "text-white" : "text-brand"
                                    }`}
                                  >
                                    <FileText size={14} />
                                    {fileLabel(file)}
                                  </a>
                                ),
                              )}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTo(message);
                                setError("");
                              }}
                              className={`inline-flex items-center gap-1 text-[11px] ${
                                mine
                                  ? "text-white/70 hover:text-white"
                                  : "text-bodyText hover:text-brand"
                              }`}
                            >
                              <Reply size={12} />
                              Reply
                            </button>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => removeMessage(message)}
                                className={`inline-flex items-center gap-1 text-[11px] ${
                                  mine
                                    ? "text-white/70 hover:text-white"
                                    : "text-bodyText hover:text-red-600"
                                }`}
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {pendingNew > 0 && (
            <button
              type="button"
              onClick={() => {
                stickToBottom.current = true;
                setPendingNew(0);
                scrollToBottom(true);
                markRead();
              }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-brand text-white text-sm px-3 py-1.5 rounded-full shadow"
            >
              {pendingNew} new {pendingNew === 1 ? "message" : "messages"}
            </button>
          )}
        </div>

        <form
          onSubmit={send}
          className="border-t border-gray-200 bg-card px-4 sm:px-6 py-4"
        >
          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {!isInbox && (
            <div className="mb-3">
              <LookupPicker
                label="Account"
                endpoint="account/lookup"
                placeholder="Search account before sending..."
                value={selectedAccount}
                displayValue={selectedAccount?.accountName || ""}
                onSelect={setSelectedAccount}
                renderItem={(a) => (
                  <div>
                    <div className="font-medium">{a.accountName}</div>
                    <div className="text-xs text-bodyText">
                      {a.industry || "Account"}
                      {a.accountOwner?.name ? ` · ${a.accountOwner.name}` : ""}
                    </div>
                  </div>
                )}
              />
            </div>
          )}
          {replyTo && (
            <div className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-brand font-semibold">
                  Replying to {replyTo.sender?.name || "message"}
                </p>
                <p className="text-sm text-bodyText truncate">
                  {previewText(replyTo.body)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-bodyText hover:text-heading"
                title="Cancel reply"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-2 bg-surface border border-gray-200 rounded-lg px-2 py-1 text-xs"
                >
                  {file.type?.startsWith("image/") ? (
                    <ImageIcon size={12} />
                  ) : (
                    <FileText size={12} />
                  )}
                  {file.name}
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary h-11 w-11 p-0"
              title="Attach files"
              disabled={!composerReady}
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              disabled={!composerReady}
              placeholder={
                !isInbox && !selectedAccount
                  ? "Select an account first, then type your price query..."
                  : viewingAll && !replyTo
                    ? "Tap Reply on a message, or open a staff member on the left..."
                    : isInbox
                      ? "Reply with vendor rates, availability or a datasheet..."
                      : "Ask for a price, share a spec, or attach a datasheet..."
              }
              className="input flex-1 min-h-[44px] max-h-40 resize-y bg-card border border-gray-200 px-3 py-2 rounded-lg"
            />
            <button
              type="submit"
              disabled={
                !composerReady ||
                sending ||
                (!body.trim() && files.length === 0)
              }
              className="btn-primary h-11 px-4"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send
            </button>
          </div>
          <p className="text-[11px] text-bodyText mt-2">
            Enter to send · Shift+Enter for a new line · up to {MAX_FILES} files,
            3MB each (images, PDF, Word, Excel)
          </p>
        </form>
      </div>
    </div>
  );
}
