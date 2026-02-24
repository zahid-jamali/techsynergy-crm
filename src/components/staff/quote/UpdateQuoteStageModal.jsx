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
  deal,
  onClose,
  onSuccess,
}) => {
  const token = sessionStorage.getItem("token");

  const [quoteStage, setQuoteStage] = useState(currentStage);
  const [probability, setProbability] = useState(deal.probability);
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

        {quoteStage === "Delivered" && (
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-red-500/20 rounded-2xl p-6 space-y-6 shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Deal Probability</p>
                <h3 className="text-2xl font-bold text-white">
                  {probability}%
                </h3>
              </div>

              {/* Dynamic Status */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium
          ${
            probability >= 70
              ? "bg-green-500/20 text-green-400"
              : probability >= 40
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400"
          }`}
              >
                {probability >= 70
                  ? "High Chance"
                  : probability >= 40
                  ? "Medium Chance"
                  : "Low Chance"}
              </div>
            </div>

            {/* Modern Slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full appearance-none h-2 rounded-lg bg-gray-800
                 [&::-webkit-slider-thumb]:appearance-none
                 [&::-webkit-slider-thumb]:h-5
                 [&::-webkit-slider-thumb]:w-5
                 [&::-webkit-slider-thumb]:rounded-full
                 [&::-webkit-slider-thumb]:bg-red-600
                 [&::-webkit-slider-thumb]:cursor-pointer
                 [&::-webkit-slider-thumb]:shadow-lg"
            />

            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${probability}%`,
                  background:
                    probability >= 70
                      ? "linear-gradient(to right, #22c55e, #16a34a)"
                      : probability >= 40
                      ? "linear-gradient(to right, #eab308, #ca8a04)"
                      : "linear-gradient(to right, #ef4444, #b91c1c)",
                }}
              />
            </div>

            {/* Preset Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProbability(p)}
                  className={`px-4 py-1 rounded-lg text-sm transition-all
            ${
              probability === p
                ? "bg-red-600 text-white shadow-lg"
                : "bg-[#1a1a1a] text-gray-400 hover:border hover:border-red-500"
            }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        )}

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
