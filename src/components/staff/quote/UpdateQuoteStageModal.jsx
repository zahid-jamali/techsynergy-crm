import { useState } from "react";

const QUOTE_STAGES = ["Draft", "Submit", "On Hold", "Confirmed"];

const UpdateQuoteStageModal = ({
  quoteId,
  currentStage,
  deal,
  onClose,
  onSuccess,
}) => {
  const token = sessionStorage.getItem("token");

  const [quoteStage, setQuoteStage] = useState(currentStage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setError("");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("quoteStage", quoteStage);

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
    <div className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-gray-200 rounded-lg w-full max-w-md text-heading">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-brand">
            Update Quote Stage
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-bodyText text-sm mb-1 block">
              Select Quote Stage
            </label>
            <select
              value={quoteStage}
              onChange={(e) => {
                setQuoteStage(e.target.value);
              }}
              className="w-full bg-card border border-gray-200 rounded-lg px-4 py-2 focus:border-brand focus:ring-1 focus:ring-brand transition"
            >
              {QUOTE_STAGES.map((stage) => {
                let isDisabled = false;

                // Rule 1: Closed Won always disabled
                if (
                  currentStage === "Delivered" &&
                  (stage === "Draft" || stage === "On Hold")
                ) {
                  isDisabled = true;
                }

                // Rule 2: If already Delivered, cannot go back
                if (
                  currentStage === "Delivered" &&
                  (stage === "Draft" || stage === "Negotiation")
                ) {
                  isDisabled = true;
                }

                if (currentStage === "On Hold") {
                  isDisabled = true;
                }

                return (
                  <option key={stage} value={stage} disabled={isDisabled}>
                    {stage}
                  </option>
                );
              })}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="bg-gray-100 px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-brand hover:bg-brand/90 px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateQuoteStageModal;
