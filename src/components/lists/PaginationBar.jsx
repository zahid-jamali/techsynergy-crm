export default function PaginationBar({ page, pages, total, limit, onPage, onLimit }) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 text-sm text-bodyText">
      <div>
        Showing {start}-{end} of {total}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1 bg-card"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
