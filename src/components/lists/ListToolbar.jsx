export default function ListToolbar({
  search,
  onSearch,
  searchPlaceholder = "Search...",
  archived,
  onArchivedChange,
  showArchive = true,
  filters = [],
  onReset,
}) {
  return (
    <div className="bg-card border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 min-w-[220px] bg-card border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-brand"
        />
        {showArchive && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {[
              { id: "false", label: "Active" },
              { id: "true", label: "Archived" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onArchivedChange(tab.id)}
                className={`px-3 py-2 ${
                  archived === tab.id
                    ? "bg-brand text-white"
                    : "bg-card text-bodyText hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-bodyText hover:text-brand"
          >
            Reset
          </button>
        )}
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <select
              key={filter.name}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-card border border-gray-200 px-3 py-2 rounded-lg text-sm"
            >
              <option value="all">{filter.allLabel || `All ${filter.name}`}</option>
              {filter.options.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
