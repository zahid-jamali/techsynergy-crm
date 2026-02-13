import { useState } from "react";

const StageUpdateModal = ({ deal, onClose, onSuccess }) => {
  const token = sessionStorage.getItem("token");

  const [stage, setStage] = useState(deal.stage || "Qualification");
  const [nextStep, setNextStep] = useState(deal.nextStep || "");
  const [loading, setLoading] = useState(false);

  const updateStage = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}deals/stage/${deal._id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stage, nextStep }),
        }
      );

      if (!res.ok) throw new Error("Failed to update stage");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Update stage failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex justify-center px-4 py-8">
        <div className="bg-black border border-gray-800 rounded-lg w-full max-w-md text-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-red-500">
              Update Deal Stage
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="input"
            >
              {[
                "Qualification",
                "Needs Analysis",
                "Value Proposition",
                "Identify Decision Makers",
                "Proposal/Price Quote",
                "Negotiation/Review",
                "Closed Won",
                "Closed Lost",
                "Closed Lost to Competition",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              placeholder="Next Step"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="input"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateStage}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Stage"}
              </button>
            </div>
          </div>
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

export default StageUpdateModal;
