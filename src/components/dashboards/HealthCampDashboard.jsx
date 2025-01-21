import React, { useState, useEffect } from "react";
import { database } from "../../firebase/config";
import { ref, onValue } from "firebase/database";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampPerformanceChart } from "./HealthCampCharts/CampPerformanceChart";
import { CampDetailsTable } from "./HealthCampCharts/CampDetailsTable";

const MetricCard = ({ title, value, description }) => (
  <Card className="bg-white">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export function HealthCampDashboard() {
  const [healthCampData, setHealthCampData] = useState([]);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const healthCampRef = ref(database, "healthCamps");
      onValue(healthCampRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedData = Object.entries(data).map(([id, camp]) => ({
            id,
            ...camp,
            date: new Date(camp.date),
            unitsSold: parseInt(camp.unitsSold || 0),
            revenue: parseFloat(camp.revenue || 0),
            marketingExpense: parseFloat(camp.marketingExpense || 0),
            operationalExpense: parseFloat(camp.operationalExpense || 0),
            amountPaidToFinance: parseFloat(camp.amountPaidToFinance || 0),
            state: camp.state || "",
            district: camp.district || "",
            nurseName: camp.nurseName || "",
            reportStatus: camp.reportStatus || "Pending",
            campCode: camp.campCode || "",
            status: camp.status || "",
          }));
          setHealthCampData(formattedData);
        }
        setLoading(false);
      });
    };
    fetchData();
  }, []);

  const calculateMetrics = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredData = healthCampData.filter((camp) => {
      if (
        selectedState !== "all" &&
        camp.state.toLowerCase() !== selectedState.toLowerCase()
      )
        return false;
      if (
        selectedDistrict !== "all" &&
        camp.district.toLowerCase() !== selectedDistrict.toLowerCase()
      )
        return false;
      return true;
    });

    const currentMonthData = filteredData.filter((camp) => {
      const campDate = camp.date;
      return (
        campDate.getMonth() === currentMonth &&
        campDate.getFullYear() === currentYear
      );
    });

    // Calculate test ranges for pie chart
    const testRangesData = [
      {
        name: "Below 25",
        value: filteredData.filter((camp) => camp.unitsSold < 25).length,
      },
      {
        name: "25-34",
        value: filteredData.filter(
          (camp) => camp.unitsSold >= 25 && camp.unitsSold < 35
        ).length,
      },
      {
        name: "35 & Above",
        value: filteredData.filter((camp) => camp.unitsSold >= 35).length,
      },
    ];

    // Calculate success rate for pie chart
    const successRateData = [
      {
        name: "Successful",
        value: filteredData.filter((camp) => camp.unitsSold >= 35).length,
      },
      {
        name: "Unsuccessful",
        value: filteredData.filter((camp) => camp.unitsSold < 35).length,
      },
    ];

    // Get last 50 completed camps for chart and table
    const last50Camps = [...filteredData]
      .filter((camp) => camp.status?.toLowerCase() === "completed")
      .sort((a, b) => b.date - a.date)
      .slice(0, 50)
      .reverse()
      .map((camp, index) => ({
        name: `Camp ${index + 1}`,
        unitsSold: camp.unitsSold,
        isSuccessful: camp.unitsSold >= 35,
        campCode: camp.campCode,
        nurseName: camp.nurseName,
        marketingExpense: camp.marketingExpense,
        operationalExpense: camp.operationalExpense,
        reportStatus: camp.reportStatus,
      }));

    // Calculate additional metrics
    const avgUnitsSold =
      filteredData.length > 0
        ? (
            filteredData.reduce((sum, camp) => sum + camp.unitsSold, 0) /
            filteredData.length
          ).toFixed(1)
        : 0;

    const successRate =
      filteredData.length > 0
        ? (
            (filteredData.filter((camp) => camp.unitsSold >= 35).length /
              filteredData.length) *
            100
          ).toFixed(1)
        : 0;

    return {
      totalCamps: filteredData.length,
      totalTests: filteredData.reduce((sum, camp) => sum + camp.unitsSold, 0),
      totalRevenue: filteredData.reduce((sum, camp) => sum + camp.revenue, 0),
      currentMonthCamps: currentMonthData.length,
      currentMonthTests: currentMonthData.reduce(
        (sum, camp) => sum + camp.unitsSold,
        0
      ),
      currentMonthRevenue: currentMonthData.reduce(
        (sum, camp) => sum + camp.revenue,
        0
      ),
      avgUnitsSold,
      successRate,
      testRangesData,
      successRateData,
      last50Camps,
    };
  };

  const metrics = calculateMetrics();

  // Get unique states and districts
  const states = [...new Set(healthCampData.map((camp) => camp.state))].filter(
    Boolean
  );
  const districts = [
    ...new Set(
      healthCampData
        .filter(
          (camp) =>
            selectedState === "all" ||
            camp.state.toLowerCase() === selectedState.toLowerCase()
        )
        .map((camp) => camp.district)
    ),
  ].filter(Boolean);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p>{`${payload[0].name}: ${payload[0].value} camps`}</p>
          <p>{`(${((payload[0].value / metrics.totalCamps) * 100).toFixed(
            1
          )}%)`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8 bg-gray-50">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">
          Health Camp Analytics
        </h2>
        <div className="flex space-x-4">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Camps (Since Inception)"
          value={metrics.totalCamps}
          description="Total number of health camps conducted"
        />
        <MetricCard
          title="Total Units Sold"
          value={metrics.totalTests}
          description="Cumulative units sold across all camps"
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          description="Total revenue generated from all camps"
        />
      </div>

      {/* Current Month Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Current Month Camps"
          value={metrics.currentMonthCamps}
          description="Number of camps this month"
        />
        <MetricCard
          title="Average Units per Camp"
          value={metrics.avgUnitsSold}
          description="Average units sold per camp"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          description="Percentage of camps achieving target"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Units Sold Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Units Sold Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.testRangesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {metrics.testRangesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Camp Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.successRateData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {metrics.successRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <CampPerformanceChart campData={metrics.last50Camps} />
      </div>

      {/* Details Table */}
      <CampDetailsTable campData={metrics.last50Camps} />
    </div>
  );
}

export default HealthCampDashboard;
