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

const DailyRevenueChart = ({ year, month }) => {
  const { data: dailyData, isLoading } = useQuery({
    queryKey: ["daily-revenue", year, month],
    queryFn: () => orderAPI.getDailyRevenueForMonth(year, month),
  });

  const dailyRevenue = dailyData?.data?.data || [];

  // Get number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Create a map of day to revenue
  const revenueMap = dailyRevenue.reduce((acc, item) => {
    acc[item.day] = item.revenue;
    return acc;
  }, {});

  // Get all days in the month with their revenue
  const chartData = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    revenue: revenueMap[index + 1] || 0,
  }));

  const maxRevenue = Math.max(...chartData.map((item) => item.revenue));
  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading daily revenue data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Daily Revenue - {monthName} {year}
        </h3>
      </div>

      {/* Chart */}
      <div className="h-80 w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            className="min-w-full"
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10 }}
              tickLine={{ stroke: "currentColor", opacity: 0.3 }}
              interval="preserveStartEnd"
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
                      <p className="font-medium">Day {label}</p>
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
              radius={[2, 2, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold">
            ${chartData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Best Day</p>
          <p className="text-lg font-semibold">
            {chartData.find((item) => item.revenue === maxRevenue)?.day ||
              "N/A"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Average</p>
          <p className="text-lg font-semibold">
            $
            {(
              chartData.reduce((sum, item) => sum + item.revenue, 0) /
              daysInMonth
            ).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Active Days</p>
          <p className="text-lg font-semibold">
            {chartData.filter((item) => item.revenue > 0).length}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Hover over bars to see exact revenue amounts</p>
      </div>
    </div>
  );
};

export default DailyRevenueChart;
