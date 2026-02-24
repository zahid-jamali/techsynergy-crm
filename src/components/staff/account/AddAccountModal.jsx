import { useState } from "react";

const AddAccountModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    accountName: "",
    accountSite: "",
    accountType: "Customer",
    industry: "",
    rating: "Active",
    ownership: "-None-",
    annualRevenue: "",
    phone: "",
    website: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    description: "",
  });

  const INDUSTRY_OPTIONS = [
    "ASP",
    "Data/Telecom OEM",
    "ERP",
    "Government/Military",
    "Large Enterprise",
    "Management ISV",
    "MSP",
    "Network Equipment Enterprise",
    "Non-management ISV",
    "Optical Networking",
    "Service Provider",
    "Small/Medium Enterprise",
    "Storage Equipment",
    "Storage Service Provider",
    "Systems Integrator",
    "Wireless Industry",
    "Financial Services",
    "Education",
    "Technology",
    "Real Estate",
    "Consulting",
    "Communications",
    "Manufacturing",
  ];

  /* ---------------- handlers ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (type, e) => {
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}account/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to create account");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* ⬇️ KEY FIX: padding + margin instead of items-center */}
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-3xl text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">
              Add New Account
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
          >
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 text-red-400 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* BASIC INFO */}
            <Section title="BASIC INFORMATION">
              <Grid>
                <Input
                  required
                  name="accountName"
                  placeholder="Account Name *"
                  value={formData.accountName}
                  onChange={handleChange}
                />
                <Input
                  name="accountSite"
                  placeholder="Account Site"
                  value={formData.accountSite}
                  onChange={handleChange}
                />
                <Input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Input
                  name="website"
                  placeholder="Website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </Grid>
            </Section>

            {/* CLASSIFICATION */}
            <Section title="CLASSIFICATION">
              <Grid cols="md:grid-cols-3">
                <Select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  options={[
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
                  ]}
                />

                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Industry</option>

                  {INDUSTRY_OPTIONS.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>

                <Select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  options={[
                    "Acquired",
                    "Active",
                    "Market Failed",
                    "Project Cancelled",
                    "Shut Down",
                  ]}
                />

                <Select
                  name="ownership"
                  value={formData.ownership}
                  onChange={handleChange}
                  options={[
                    "-None-",
                    "Private",
                    "Public",
                    "Government",
                    "Partnership",
                    "Privately Held",
                    "Public Company",
                  ]}
                />

                <Input
                  type="number"
                  name="annualRevenue"
                  placeholder="Annual Revenue"
                  value={formData.annualRevenue}
                  onChange={handleChange}
                />
              </Grid>
            </Section>

            {/* ADDRESSES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["billingAddress"].map((type) => (
                <Section
                  key={type}
                  title={
                    type === "billingAddress"
                      ? "Billing Address"
                      : "Shipping Address"
                  }
                >
                  <div className="space-y-3">
                    {["street", "city", "state", "postalCode", "country"].map(
                      (field) => (
                        <Input
                          key={field}
                          name={field}
                          placeholder={field}
                          value={formData[type][field]}
                          onChange={(e) => handleAddressChange(type, e)}
                        />
                      )
                    )}
                  </div>
                </Section>
              ))}
            </div>

            {/* DESCRIPTION */}
            <textarea
              name="description"
              placeholder="Description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="input"
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Shared styles */}
      <style jsx>{`
        .input {
          width: 100%;
          background: #111827;
          border: 1px solid #374151;
          padding: 8px 10px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

/* ---------- Small reusable components ---------- */

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-semibold text-gray-400 mb-3 tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children, cols = "md:grid-cols-2" }) => (
  <div className={`grid grid-cols-1 ${cols} gap-4`}>{children}</div>
);

const Input = (props) => <input {...props} className="input" />;

const Select = ({ options, ...props }) => (
  <select {...props} className="input">
    {options.map((o) => (
      <option key={o}>{o}</option>
    ))}
  </select>
);

export default AddAccountModal;
