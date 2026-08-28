import { quoteDownloadName } from "../../../lib/quotePricing";

export default function QuotePdfLink({ quote, className = "text-emerald-700 hover:underline" }) {
  const href = `${process.env.REACT_APP_BACKEND_URL}quotes/${quote._id}/pdf`;
  return (
    <a
      href={href}
      download={quoteDownloadName(quote, "pdf")}
      className={className}
    >
      PDF
    </a>
  );
}
