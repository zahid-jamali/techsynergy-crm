import { api } from "../../lib/api";

export default function ArchiveButton({ path, archived, onDone }) {
  const label = archived ? "Restore" : "Archive";
  const handleClick = async () => {
    const ok = window.confirm(
      archived ? "Restore this record to the active list?" : "Archive this record? You can restore it later."
    );
    if (!ok) return;
    await api(path, {
      method: "PATCH",
      body: JSON.stringify({ archived: !archived }),
    });
    onDone();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={archived ? "text-emerald-700 hover:underline" : "text-bodyText hover:underline"}
    >
      {label}
    </button>
  );
}
