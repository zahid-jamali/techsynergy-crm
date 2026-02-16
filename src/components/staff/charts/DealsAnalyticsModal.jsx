import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Download,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

const DealsAnalyticsModal = ({ deals, onClose }) => {
  const [timeRange, setTimeRange] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [selectedCurrency, setSelectedCurrency] = useState("all");
  const [showCurrencyBreakdown, setShowCurrencyBreakdown] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(280); // Default fallback rate
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch live USD to PKR exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoadingRate(true);
      try {
        // Using a free exchange rate API
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const data = await response.json();
        if (data.rates && data.rates.PKR) {
          setExchangeRate(data.rates.PKR);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate, using fallback:", error);
        // Fallback to a reasonable rate if API fails
        setExchangeRate(280);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Color palette for charts
  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  // Currency symbols and formatting
  const currencyConfig = {
    USD: { symbol: "$", icon: DollarSign, color: "#10b981", position: "left" },
    PKR: {
      symbol: "Rs.",
      icon: IndianRupee,
      color: "#f59e0b",
      position: "left",
    },
  };

  // Convert USD to PKR
  const convertToPKR = (amount, currency) => {
    if (currency === "PKR") return amount;
    if (currency === "USD") return amount * exchangeRate;
    return amount; // Default fallback
  };

  // Process deals with currency conversion for PKR primary view
  const processedDeals = useMemo(() => {
    const dealsArray = deals || [];

    // Create a new array with converted amounts for PKR primary view
    return dealsArray.map((deal) => ({
      ...deal,
      // Store original values
      originalAmount: deal.amount,
      originalCurrency: deal.currency,
      originalExpectedRevenue: deal.expectedRevenue,
      // Add PKR converted values
      amountInPKR: convertToPKR(deal.amount || 0, deal.currency),
      expectedRevenueInPKR: convertToPKR(
        deal.expectedRevenue || 0,
        deal.currency
      ),
    }));
  }, [deals, exchangeRate]);

  // Filter deals by currency
  const filteredDeals = useMemo(() => {
    const dealsArray = processedDeals || [];
    if (selectedCurrency === "all") return dealsArray;
    return dealsArray.filter((d) => d.currency === selectedCurrency);
  }, [processedDeals, selectedCurrency]);

  // Filter deals by time range
  const timeFilteredDeals = useMemo(() => {
    const dealsArray = filteredDeals || [];
    if (timeRange === "all") return dealsArray;

    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return dealsArray;
    }

    return dealsArray.filter((d) => new Date(d.createdAt) >= startDate);
  }, [filteredDeals, timeRange]);

  // Get unique currencies for filter
  const availableCurrencies = useMemo(() => {
    const dealsArray = deals || [];
    const currencies = new Set(
      dealsArray.map((d) => d.currency).filter(Boolean)
    );
    return Array.from(currencies);
  }, [deals]);

  // KPI Calculations with PKR as primary currency
  const kpis = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];

    // Group by currency (original currency for breakdown)
    const byCurrency = {};
    // PKR totals (converted)
    let totalAmountPKR = 0;
    let totalExpectedPKR = 0;
    let weightedPipelinePKR = 0;

    dealsArray.forEach((deal) => {
      const currency = deal.currency || "USD";

      // Original currency tracking
      if (!byCurrency[currency]) {
        byCurrency[currency] = {
          totalAmount: 0,
          totalExpected: 0,
          weightedPipeline: 0,
          count: 0,
        };
      }
      byCurrency[currency].totalAmount += deal.amount || 0;
      byCurrency[currency].totalExpected += deal.expectedRevenue || 0;
      byCurrency[currency].weightedPipeline +=
        ((deal.amount || 0) * (deal.probability || 0)) / 100;
      byCurrency[currency].count++;

      // PKR totals (all converted)
      totalAmountPKR += deal.amountInPKR || 0;
      totalExpectedPKR += deal.expectedRevenueInPKR || 0;
      weightedPipelinePKR +=
        ((deal.amountInPKR || 0) * (deal.probability || 0)) / 100;
    });

    const totalDeals = dealsArray.length;
    const avgDealSizePKR = totalDeals > 0 ? totalAmountPKR / totalDeals : 0;
    const closedDeals = dealsArray.filter(
      (d) => d.stage === "Closed Won" || d.stage === "Closed Lost"
    ).length;
    const activeDeals = totalDeals - closedDeals;
    const conversionRate =
      totalDeals > 0
        ? (
            (dealsArray.filter((d) => d.stage === "Closed Won").length /
              totalDeals) *
            100
          ).toFixed(1)
        : 0;

    return {
      totalDeals,
      totalAmountPKR,
      totalExpectedPKR,
      avgDealSizePKR,
      weightedPipelinePKR,
      activeDeals,
      conversionRate,
      byCurrency,
      currencies: availableCurrencies.join(", ") || "N/A",
      exchangeRate,
      lastUpdated,
    };
  }, [timeFilteredDeals, availableCurrencies, exchangeRate, lastUpdated]);

  // Stage Distribution with counts
  const stageData = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];
    const stageMap = {};
    dealsArray.forEach((d) => {
      stageMap[d.stage] = (stageMap[d.stage] || 0) + 1;
    });
    return Object.keys(stageMap).map((stage) => ({
      stage,
      count: stageMap[stage],
      percentage:
        dealsArray.length > 0
          ? ((stageMap[stage] / dealsArray.length) * 100).toFixed(1)
          : 0,
    }));
  }, [timeFilteredDeals]);

  // Amount by Stage with PKR as primary
  const amountData = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];
    const amountMap = {};
    const currencyMap = {};

    dealsArray.forEach((d) => {
      const currency = d.currency || "USD";
      if (!amountMap[d.stage]) {
        amountMap[d.stage] = {
          totalPKR: 0,
          byCurrency: {},
          originalTotal: 0,
        };
      }
      amountMap[d.stage].totalPKR += d.amountInPKR || 0;
      amountMap[d.stage].originalTotal += d.amount || 0;
      amountMap[d.stage].byCurrency[currency] =
        (amountMap[d.stage].byCurrency[currency] || 0) + (d.amount || 0);

      if (!currencyMap[d.stage]) {
        currencyMap[d.stage] = new Set();
      }
      currencyMap[d.stage].add(currency);
    });

    return Object.keys(amountMap).map((stage) => ({
      stage,
      amount: amountMap[stage].totalPKR, // Now in PKR
      originalAmount: amountMap[stage].originalTotal,
      byCurrency: amountMap[stage].byCurrency,
      currencies: Array.from(currencyMap[stage] || []),
      avgAmount:
        stageData.find((s) => s.stage === stage)?.count > 0
          ? amountMap[stage].totalPKR /
            stageData.find((s) => s.stage === stage)?.count
          : 0,
    }));
  }, [timeFilteredDeals, stageData]);

  // Probability Distribution
  const probabilityData = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];
    const ranges = {
      "0-25%": 0,
      "26-50%": 0,
      "51-75%": 0,
      "76-100%": 0,
    };

    dealsArray.forEach((d) => {
      const prob = d.probability || 0;
      if (prob <= 25) ranges["0-25%"]++;
      else if (prob <= 50) ranges["26-50%"]++;
      else if (prob <= 75) ranges["51-75%"]++;
      else ranges["76-100%"]++;
    });

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  }, [timeFilteredDeals]);

  // Monthly Trend Data with PKR as primary
  const monthlyData = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];
    const monthly = {};
    dealsArray.forEach((d) => {
      const date = new Date(d.createdAt);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      const currency = d.currency || "USD";

      if (!monthly[monthYear]) {
        monthly[monthYear] = {
          month: monthYear,
          deals: 0,
          amountPKR: 0,
          expectedPKR: 0,
          byCurrency: {},
        };
      }
      monthly[monthYear].deals++;
      monthly[monthYear].amountPKR += d.amountInPKR || 0;
      monthly[monthYear].expectedPKR += d.expectedRevenueInPKR || 0;
      monthly[monthYear].byCurrency[currency] =
        (monthly[monthYear].byCurrency[currency] || 0) + (d.amount || 0);
    });
    return Object.values(monthly).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
  }, [timeFilteredDeals]);

  // Top Accounts with PKR as primary
  const topAccounts = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];
    const accountMap = {};
    dealsArray.forEach((d) => {
      const accountName = d.account?.accountName || "Unknown";
      const currency = d.currency || "USD";

      if (!accountMap[accountName]) {
        accountMap[accountName] = {
          name: accountName,
          deals: 0,
          amountPKR: 0,
          byCurrency: {},
        };
      }
      accountMap[accountName].deals++;
      accountMap[accountName].amountPKR += d.amountInPKR || 0;
      accountMap[accountName].byCurrency[currency] =
        (accountMap[accountName].byCurrency[currency] || 0) + (d.amount || 0);
    });
    return Object.values(accountMap)
      .sort((a, b) => b.amountPKR - a.amountPKR)
      .slice(0, 5);
  }, [timeFilteredDeals]);

  // Upcoming Closures with PKR amounts
  const upcomingClosures = useMemo(() => {
    const dealsArray = timeFilteredDeals || [];
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);

    return dealsArray
      .filter((d) => {
        const closingDate = new Date(d.closingDate);
        return (
          closingDate <= nextMonth &&
          closingDate >= now &&
          d.stage !== "Closed Won" &&
          d.stage !== "Closed Lost"
        );
      })
      .sort((a, b) => new Date(a.closingDate) - new Date(b.closingDate))
      .slice(0, 5);
  }, [timeFilteredDeals]);

  // Format amount in PKR (primary currency)
  const formatPKR = (amount) => {
    const formattedAmount = amount?.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `Rs. ${formattedAmount}`;
  };

  // Format amount with original currency for display
  const formatOriginalAmount = (amount, currency = "USD") => {
    const config = currencyConfig[currency] || currencyConfig.USD;
    const formattedAmount = amount?.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${config.symbol} ${formattedAmount}`;
  };

  // Handle empty state
  if (!deals || deals.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center px-4 py-6">
        <div className="bg-[#0B0F1A] border border-gray-800 rounded-2xl w-full max-w-7xl text-white shadow-2xl flex flex-col max-h-[95vh]">
          <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-red-500">Deals Analytics</h2>
            <button
              onClick={onClose}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <Activity size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No deals data available</p>
              <p className="text-gray-500 text-sm mt-2">
                Add some deals to see analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const csvData = processedDeals.map((d) => ({
      "Deal Name": d.dealName || "N/A",
      Account: d.account?.accountName || "N/A",
      Stage: d.stage || "N/A",
      "Original Amount": d.originalAmount || 0,
      "Original Currency": d.originalCurrency || "N/A",
      "Amount in PKR": d.amountInPKR || 0,
      "Exchange Rate Used":
        d.originalCurrency === "USD" ? `1 USD = ${exchangeRate} PKR` : "N/A",
      Probability: `${d.probability || 0}%`,
      "Expected Revenue (PKR)": d.expectedRevenueInPKR || 0,
      "Closing Date": d.closingDate
        ? new Date(d.closingDate).toLocaleDateString()
        : "N/A",
      Contact: d.contact
        ? `${d.contact.firstName || ""} ${d.contact.lastName || ""}`.trim() ||
          "N/A"
        : "N/A",
    }));

    const convertToCSV = (data) => {
      if (data.length === 0) return "";
      const header = Object.keys(data[0]).join(",");
      const rows = data.map((obj) =>
        Object.values(obj)
          .map((val) => `"${val}"`)
          .join(",")
      );
      return [header, ...rows].join("\n");
    };

    const downloadCSV = (csv, filename) => {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const csv = convertToCSV(csvData);
    downloadCSV(csv, "deals_analytics.csv");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center px-4 py-6">
      <div className="bg-[#0B0F1A] border border-gray-800 rounded-2xl w-full max-w-7xl text-white shadow-2xl flex flex-col max-h-[95vh] animate-fadeIn">
        {/* Header with Actions */}
        <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-[#0F1421] to-[#0B0F1A]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                Deals Analytics
              </h2>
              <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                PKR Primary
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <Activity size={14} className="text-red-500" />
              All amounts shown in PKR (1 USD = {exchangeRate} PKR)
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated: {lastUpdated}
                </span>
              )}
              {isLoadingRate && (
                <RefreshCw size={12} className="animate-spin text-gray-500" />
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Filter */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="all">All Currencies (Converted to PKR)</option>
              {availableCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency} Only
                </option>
              ))}
            </select>

            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
              title="Export Data"
            >
              <Download size={18} className="text-gray-400" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Exchange Rate Banner */}
          {exchangeRate && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <IndianRupee size={16} className="text-yellow-500" />
                  <span className="text-gray-300">
                    All amounts are displayed in{" "}
                    <span className="font-bold text-yellow-500">
                      Pakistani Rupees (PKR)
                    </span>
                  </span>
                </div>
                <div className="text-gray-400">
                  Exchange Rate:{" "}
                  <span className="text-white font-medium">
                    1 USD = {exchangeRate} PKR
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Currency Summary Chips */}
          {showCurrencyBreakdown && Object.keys(kpis.byCurrency).length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {Object.entries(kpis.byCurrency).map(([currency, data]) => {
                const Icon = currencyConfig[currency]?.icon || DollarSign;
                const color = currencyConfig[currency]?.color || "#10b981";
                return (
                  <div
                    key={currency}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700"
                    style={{ borderLeftColor: color, borderLeftWidth: "4px" }}
                  >
                    <Icon size={16} style={{ color }} />
                    <span className="text-sm font-medium">{currency}</span>
                    <span className="text-sm text-gray-400">
                      {formatOriginalAmount(data.totalAmount, currency)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({data.count} deals)
                    </span>
                    {currency === "USD" && (
                      <span className="text-xs text-yellow-500">
                        ≈ {formatPKR(data.totalAmount * exchangeRate)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* KPI Cards Grid - All in PKR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              icon={<TrendingUp size={20} />}
              label="Total Deals"
              value={kpis.totalDeals}
              subValue={`${kpis.activeDeals} active`}
              accent="from-blue-500 to-blue-600"
            />
            <KpiCard
              icon={<IndianRupee size={20} />}
              label="Pipeline Value (PKR)"
              value={formatPKR(kpis.totalAmountPKR)}
              subValue={`Avg: ${formatPKR(kpis.avgDealSizePKR)}`}
              accent="from-purple-500 to-purple-600"
            />
            <KpiCard
              icon={<Target size={20} />}
              label="Expected Revenue (PKR)"
              value={formatPKR(kpis.totalExpectedPKR)}
              subValue={`Weighted: ${formatPKR(kpis.weightedPipelinePKR)}`}
              accent="from-red-500 to-red-600"
            />
            <KpiCard
              icon={<Calendar size={20} />}
              label="Conversion Rate"
              value={`${kpis.conversionRate}%`}
              subValue={`${kpis.currencies}`}
              accent="from-green-500 to-green-600"
            />
          </div>

          {/* Chart Controls */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "bar"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "area"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              <Activity size={18} />
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`p-2 rounded-lg transition-colors ${
                chartType === "pie"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              <PieChartIcon size={18} />
            </button>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            <ChartCard
              title="Deals by Stage"
              subtitle="Distribution across pipeline stages"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={stageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        label={({ stage, percentage }) =>
                          `${stage} (${percentage}%)`
                        }
                      >
                        {stageData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  ) : (
                    <BarChart
                      data={stageData}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9CA3AF" />
                      <YAxis
                        type="category"
                        dataKey="stage"
                        stroke="#9CA3AF"
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#ef4444"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Amount by Stage - Now in PKR */}
            <ChartCard
              title="Revenue by Stage (PKR)"
              subtitle="Total amount per pipeline stage in Pakistani Rupees"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amountData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="stage"
                      stroke="#9CA3AF"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value, name, props) => {
                        if (name === "amount") {
                          const currencies = props.payload.currencies;
                          if (currencies?.length > 1 && showCurrencyBreakdown) {
                            const breakdown = Object.entries(
                              props.payload.byCurrency || {}
                            )
                              .map(
                                ([curr, val]) =>
                                  `${curr}: ${formatOriginalAmount(val, curr)}`
                              )
                              .join(" • ");
                            return [
                              formatPKR(value),
                              `Total PKR (${breakdown})`,
                            ];
                          }
                          return [formatPKR(value), "Total Amount (PKR)"];
                        }
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {amountData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Monthly Trend - Now in PKR */}
            <ChartCard
              title="Monthly Trend (PKR)"
              subtitle="Deals created over time in Pakistani Rupees"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value, name) => {
                        if (name === "amountPKR")
                          return [formatPKR(value), "Amount (PKR)"];
                        if (name === "expectedPKR")
                          return [formatPKR(value), "Expected (PKR)"];
                        if (name === "deals") return [value, "# of Deals"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="deals"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      name="# of Deals"
                    />
                    <Area
                      type="monotone"
                      dataKey="amountPKR"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      name="Amount (PKR)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Probability Distribution */}
            <ChartCard
              title="Deals by Probability"
              subtitle="Risk assessment distribution"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={probabilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]}>
                      {probabilityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Bottom Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Accounts - Now in PKR */}
            <ChartCard
              title="Top Accounts by Value (PKR)"
              subtitle="Highest revenue generating accounts in Pakistani Rupees"
            >
              <div className="space-y-3">
                {topAccounts.length > 0 ? (
                  topAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{
                            background: `linear-gradient(to bottom, ${
                              COLORS[index % COLORS.length]
                            }, ${COLORS[(index + 2) % COLORS.length]})`,
                          }}
                        />
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-xs text-gray-400">
                            {account.deals} deals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-400">
                          {formatPKR(account.amountPKR)}
                        </p>
                        {Object.keys(account.byCurrency).length > 1 && (
                          <p className="text-xs text-gray-500">
                            {Object.entries(account.byCurrency)
                              .map(
                                ([curr, val]) =>
                                  `${curr}: ${formatOriginalAmount(val, curr)}`
                              )
                              .join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No account data available
                  </p>
                )}
              </div>
            </ChartCard>

            {/* Upcoming Closures - Show both original and PKR */}
            <ChartCard
              title="Upcoming Closures"
              subtitle="Deals closing in next 30 days"
            >
              <div className="space-y-3">
                {upcomingClosures.length > 0 ? (
                  upcomingClosures.map((deal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div>
                        <p className="font-medium">
                          {deal.dealName || "Unnamed Deal"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {deal.account?.accountName || "No Account"} •{" "}
                          {deal.currency || "USD"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-400">
                          {formatPKR(deal.amountInPKR)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatOriginalAmount(deal.amount, deal.currency)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {deal.closingDate
                            ? new Date(deal.closingDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "No date"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No upcoming closures
                  </p>
                )}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

const KpiCard = ({ icon, label, value, subValue, accent }) => (
  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6 overflow-hidden group hover:border-gray-600 transition-all duration-300">
    <div
      className={`absolute inset-0 bg-gradient-to-r ${accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
    />
    <div className="relative z-10">
      <div className="flex items-start justify-between">
        <div
          className={`p-2 bg-gradient-to-br ${accent} rounded-lg bg-opacity-20 text-white`}
        >
          {icon}
        </div>
        <span className="text-xs text-gray-400">Current</span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subValue}</p>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
    {children}
  </div>
);

export default DealsAnalyticsModal;
