import { useEffect, useState } from "react";
// import UpsertTargetModal from "./modals/UpsertTargetModal";
// import DeleteTargetModal from "./modals/DeleteTargetModal";

import UpsertTargetModal from "../components/admin/UpsertTargetModal";
import DeleteTargetModal from "../components/admin/DeleteTargetModal";

const SalesTargetPage = () => {
  const token = sessionStorage.getItem("token");

  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const [targets, setTargets] = useState([]);
  const [teamSummary, setTeamSummary] = useState({
    totalTarget: 0,
    totalForecast: 0,
  });

  const [loading, setLoading] = useState(false);

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ================= FETCH TEAM SUMMARY ================= */
  const fetchTeamSummary = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sales-target/team-summary?month=${month}&year=${year}`,
      { headers: { authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    if (data.success) setTeamSummary(data.data);
  };

  /* ================= FETCH ALL TARGETS FOR MONTH ================= */
  const fetchTargets = async () => {
    setLoading(true);

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sales-target/get?month=${month}&year=${year}`,
      { headers: { authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    if (data.success) {
      // We need user-wise data — better create route if needed
      setTargets(data.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeamSummary();
    fetchTargets();
  }, [month, year]);

  /* ================= CALCULATIONS ================= */

  const achievementPercentage =
    teamSummary.totalTarget > 0
      ? ((teamSummary.totalForecast / teamSummary.totalTarget) * 100).toFixed(1)
      : 0;

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-500">
          Sales Targets Management
        </h1>

        <button
          onClick={() => {
            setSelectedTarget(null);
            setShowUpsertModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          + Add Target
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="input w-40"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input w-32"
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Target"
          value={`₹ ${teamSummary.totalTarget}`}
        />
        <SummaryCard
          title="Total Forecast"
          value={`₹ ${teamSummary.totalForecast}`}
        />
        <SummaryCard
          title="Achievement %"
          value={`${achievementPercentage}%`}
          highlight
        />
      </div>

      {/* TABLE */}
      <div className="bg-[#0f172a] border border-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#111827] text-gray-400">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-center">Target</th>
              <th className="p-3 text-center">Forecast</th>
              <th className="p-3 text-center">Achievement</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {targets.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No targets found
                </td>
              </tr>
            )}

            {targets.map((t) => {
              const percentage =
                t.targetAmount > 0
                  ? ((t.forecastAmount / t.targetAmount) * 100).toFixed(1)
                  : 0;

              return (
                <tr key={t._id} className="border-t border-gray-800">
                  <td className="p-3">{t.user?.name}</td>
                  <td className="p-3 text-center">₹ {t.targetAmount}</td>
                  <td className="p-3 text-center">₹ {t.forecastAmount}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        percentage >= 100
                          ? "bg-green-900 text-green-400"
                          : "bg-yellow-900 text-yellow-400"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedTarget(t);
                        setShowUpsertModal(true);
                      }}
                      className="text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTarget(t);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showUpsertModal && (
        <UpsertTargetModal
          target={selectedTarget}
          month={month}
          year={year}
          onClose={() => setShowUpsertModal(false)}
          onSuccess={() => {
            fetchTeamSummary();
            setShowUpsertModal(false);
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteTargetModal
          target={selectedTarget}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            fetchTeamSummary();
            setShowDeleteModal(false);
          }}
        />
      )}

      <style jsx>{`
        .input {
          background: #111827;
          border: 1px solid #374151;
          padding: 8px 10px;
          border-radius: 6px;
          color: white;
        }
      `}</style>
    </div>
  );
};

/* ================= SUMMARY CARD ================= */
const SummaryCard = ({ title, value, highlight }) => (
  <div className="bg-[#111827] border border-gray-800 rounded-lg p-5">
    <p className="text-gray-400 text-sm">{title}</p>
    <h2
      className={`text-2xl font-bold mt-2 ${
        highlight ? "text-red-500" : "text-white"
      }`}
    >
      {value}
    </h2>
  </div>
);

export default SalesTargetPage;
