import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MonthlyRevenueChart = ({ year }) => {
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["monthly-revenue", year],
    queryFn: () => orderAPI.getMonthlyRevenue(year),
  });

  const monthlyRevenue = monthlyData?.data?.data || [];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Create a map of month to revenue
  const revenueMap = monthlyRevenue.reduce((acc, item) => {
    acc[item.month] = item.revenue;
    return acc;
  }, {});

  // Get all 12 months with their revenue
  const chartData = monthNames.map((month, index) => ({
    month: month.substring(0, 3), // Short month name
    fullMonth: month,
    revenue: revenueMap[index + 1] || 0,
  }));

  const maxRevenue = Math.max(...chartData.map((item) => item.revenue));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading monthly revenue data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">Monthly Revenue - {year}</h3>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "currentColor", opacity: 0.3 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: "currentColor", opacity: 0.3 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{label}</p>
                      <p className="text-primary font-semibold">
                        Revenue: ${payload[0].value.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold">
            ${chartData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Best Month</p>
          <p className="text-lg font-semibold">
            {chartData.find((item) => item.revenue === maxRevenue)?.fullMonth ||
              "N/A"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Average</p>
          <p className="text-lg font-semibold">
            $
            {(
              chartData.reduce((sum, item) => sum + item.revenue, 0) / 12
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
