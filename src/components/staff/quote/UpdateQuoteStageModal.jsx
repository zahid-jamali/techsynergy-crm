import { useState } from "react";

const QUOTE_STAGES = [
  "Draft",
  "Negotiation",
  "Delivered",
  "On Hold",
  "Confirmed",
  "Closed Won",
  "Closed Lost",
];

const UpdateQuoteStageModal = ({
  quoteId,
  currentStage,
  onClose,
  onSuccess,
}) => {
  const token = sessionStorage.getItem("token");

  const [quoteStage, setQuoteStage] = useState(currentStage);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setError("");

    // 🚨 Frontend validation
    if (quoteStage === "Confirmed" && !purchaseOrder) {
      setError("Purchase Order is required to confirm the quote");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("quoteStage", quoteStage);

      if (quoteStage === "Confirmed") {
        formData.append("purchaseOrder", purchaseOrder);
      }

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}quotes/${quoteId}/updateStage`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to update quote stage");
      }

      onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-red-500">
            Update Quote Stage
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Select Quote Stage
            </label>
            <select
              value={quoteStage}
              onChange={(e) => {
                setQuoteStage(e.target.value);
                setPurchaseOrder(null); // reset PO if stage changes
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            >
              {QUOTE_STAGES.map((stage) => (
                <>
                  {stage === "Closed Won" ? (
                    <>
                      <option key={stage} disabled>
                        {stage}
                      </option>
                    </>
                  ) : (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  )}
                </>
              ))}
            </select>
          </div>

          {/* 🧾 PO Upload (ONLY FOR CONFIRMED) */}
          {quoteStage === "Confirmed" && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Upload Purchase Order (PDF / Image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setPurchaseOrder(e.target.files[0])}
                className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Purchase Order is mandatory to confirm the quote
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateQuoteStageModal;
