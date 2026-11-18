import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

/* Shared building blocks for the Finance and Operations desks. */

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand/70 mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  brand: "bg-brand/10 text-brand",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  violet: "bg-violet-50 text-violet-700",
  sky: "bg-sky-50 text-sky-700",
  gray: "bg-gray-100 text-bodyText",
};

export function KpiCard({ label, value, hint, icon: Icon, tone = "brand", onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`kpi-card text-left w-full ${
        onClick ? "hover:border-brand/40 hover:shadow-elevate transition cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-bodyText">
          {label}
        </p>
        {Icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-heading mt-2 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-bodyText mt-1">{hint}</p>}
    </Tag>
  );
}

export function Pill({ tone = "gray", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const FBR_STATUS = {
  submitted: ["green", "Reported to FBR"],
  validated: ["sky", "FBR validated"],
  failed: ["red", "FBR rejected"],
  not_submitted: ["gray", "Not reported"],
};

export function FbrBadge({ fbr }) {
  const [tone, label] = FBR_STATUS[fbr?.status || "not_submitted"] || FBR_STATUS.not_submitted;
  return <Pill tone={tone}>{label}</Pill>;
}

const ALERT = {
  error: ["bg-red-50 border-red-200 text-red-800", XCircle],
  success: ["bg-emerald-50 border-emerald-200 text-emerald-800", CheckCircle2],
  warning: ["bg-amber-50 border-amber-200 text-amber-800", AlertTriangle],
  info: ["bg-sky-50 border-sky-200 text-sky-800", Info],
};

export function Alert({ type = "info", title, children, onClose }) {
  if (!children && !title) return null;
  const [cls, Icon] = ALERT[type];
  return (
    <div className={`flex gap-3 border rounded-lg px-3.5 py-3 text-sm ${cls}`} role="alert">
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, footer, size = "max-w-2xl" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal-panel ${size} flex flex-col`}>
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-semibold text-heading">{title}</h2>
            {subtitle && <p className="text-sm text-bodyText mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-bodyText hover:bg-surface hover:text-heading"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-2 sticky bottom-0 bg-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="py-14 text-center">
      {Icon && (
        <div className="w-12 h-12 mx-auto rounded-full bg-surface flex items-center justify-center text-bodyText mb-3">
          <Icon size={22} />
        </div>
      )}
      <p className="font-medium text-heading">{title}</p>
      {children && <p className="text-sm text-bodyText mt-1 max-w-md mx-auto">{children}</p>}
    </div>
  );
}

export function Tabs({ value, onChange, items }) {
  return (
    <div className="inline-flex flex-wrap gap-1 p-1 bg-card border border-gray-200 rounded-lg">
      {items.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
            value === t.value ? "bg-brand text-white shadow-sm" : "text-bodyText hover:bg-surface"
          }`}
        >
          {t.label}
          {t.count != null && (
            <span
              className={`ml-1.5 text-xs ${value === t.value ? "text-white/80" : "text-bodyText/70"}`}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-bodyText mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export function Section({ title, description, actions, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-heading">{title}</h3>
            {description && <p className="text-xs text-bodyText mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ cols = 6, rows = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c}>
          <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + ((r + c) % 4) * 12}%` }} />
        </td>
      ))}
    </tr>
  ));
}
