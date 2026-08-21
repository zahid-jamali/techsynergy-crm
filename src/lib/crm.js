export const ACCOUNT_TYPES = [
  "Analyst",
  "Competitor",
  "Customer",
  "Distributor",
  "Integrator",
  "Investor",
  "Other",
  "Partner",
  "Press",
  "Prospect",
  "Reseller",
  "Supplier",
  "Vendor",
];

export const INDUSTRIES = [
  "ASP",
  "Banking",
  "FMCG",
  "Pharma",
  "Textile",
  "Logistics",
  "Automobile",
  "Hospitals",
  "Technology",
  "Education",
  "Manufacturing",
  "Financial Services",
  "Government/Military",
  "Large Enterprise",
  "Small/Medium Enterprise",
  "Consulting",
  "Communications",
  "Real Estate",
];

export const DEAL_STAGES = [
  "Qualification",
  "Needs Analysis",
  "Value Proposition",
  "Identify Decision Makers",
  "Proposal/Price Quote",
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
  "Closed Lost to Competition",
];

export const QUOTE_STAGES = [
  "Draft",
  "Negotiation",
  "Delivered",
  "On Hold",
  "Confirmed",
  "Closed Won",
  "Closed Lost",
];

export function contactName(c) {
  if (!c) return "-";
  return `${c.firstName || ""} ${c.lastName || ""}`.trim() || "-";
}

export function ownerName(owner) {
  if (!owner) return "-";
  if (typeof owner === "string") return owner;
  return owner.name || owner.email || "-";
}
