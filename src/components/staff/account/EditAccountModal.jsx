import { useState } from "react";
import AccountWrapperModal from "./AccountWrapperModal";

const EditAccountModal = ({ account, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ...account,
  });

  const INDUSTRY_OPTIONS = [
    "ASP",
    "Data/Telecom OEM",
    "ERP",
    "Health and emergency services",
    "Hospitals",
    "Banking",
    "FMCG",
    "Pharma",
    "Textile",
    "Logistics",
    "Automobile",
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
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}account/update/${account._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Failed to update");

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountWrapperModal title="Edit Account" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="p-6 max-h-[80vh] overflow-y-auto space-y-6"
      >
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* BASIC INFO */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="Account Name"
              className="input"
            />

            <input
              name="accountSite"
              value={formData.accountSite || ""}
              onChange={handleChange}
              placeholder="Account Site"
              className="input"
            />

            <input
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Phone"
              className="input"
            />

            <input
              name="website"
              value={formData.website || ""}
              onChange={handleChange}
              placeholder="Website"
              className="input"
            />
          </div>
        </div>

        {/* CLASSIFICATION */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
            Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="input"
            >
              {[
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
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              name="industry"
              value={formData.industry || ""}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Industry</option>
              {INDUSTRY_OPTIONS.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>

            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="input"
            >
              {[
                "Acquired",
                "Active",
                "Market Failed",
                "Project Cancelled",
                "Shut Down",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <select
              name="ownership"
              value={formData.ownership}
              onChange={handleChange}
              className="input"
            >
              {[
                "-None-",
                "Private",
                "Public",
                "Government",
                "Partnership",
                "Privately Held",
                "Public Company",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>

            <input
              type="number"
              name="annualRevenue"
              value={formData.annualRevenue || ""}
              onChange={handleChange}
              placeholder="Annual Revenue"
              className="input"
            />
          </div>
        </div>

        {/* ADDRESSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["billingAddress", "shippingAddress"].map((type) => (
            <div key={type}>
              <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
                {type === "billingAddress"
                  ? "Billing Address"
                  : "Shipping Address"}
              </h3>

              <div className="space-y-3">
                {["street", "city", "state", "postalCode", "country"].map(
                  (field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field}
                      value={formData[type]?.[field] || ""}
                      onChange={(e) => handleAddressChange(type, e)}
                      className="input"
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* DESCRIPTION */}
        <div>
          <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
            Description
          </h3>
          <textarea
            name="description"
            rows="3"
            value={formData.description || ""}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Account"}
          </button>
        </div>

        {/* Shared Input Style */}
        <style jsx>{`
          .input {
            width: 100%;
            background: #111827;
            border: 1px solid #374151;
            padding: 8px 10px;
            border-radius: 6px;
            color: white;
          }
        `}</style>
      </form>
    </AccountWrapperModal>
  );
};

export default EditAccountModal;
