// CampPerformanceChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CampPerformanceChart = ({ campData }) => {
  return (
    <Card className="md:col-span-2 bg-white shadow-lg border-blue-100">
      <CardHeader className="border-b border-blue-50">
        <CardTitle className="text-xl font-semibold text-blue-800">
          Last 50 Completed Camps Units Sold
        </CardTitle>
        <p className="text-sm text-pink-500">
          Performance overview of recent camps
        </p>
      </CardHeader>
      <CardContent className="h-96 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={campData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-blue-100"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#1e40af", fontSize: 11 }}
              tickLine={{ stroke: "#93c5fd" }}
              axisLine={{ stroke: "#93c5fd" }}
              dy={5}
              interval={4}
            />
            <YAxis
              tick={{ fill: "#1e40af", fontSize: 11 }}
              tickLine={{ stroke: "#93c5fd" }}
              axisLine={{ stroke: "#93c5fd" }}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const isSuccessful = payload[0].payload.isSuccessful;
                  return (
                    <div
                      className={`
                      p-4 rounded-lg shadow-lg border-2
                      ${
                        isSuccessful
                          ? "bg-green-50 border-green-200"
                          : "bg-blue-50 border-blue-200"
                      }
                    `}
                    >
                      <p className="font-medium text-blue-900">{`Camp Code: ${payload[0].payload.campCode}`}</p>
                      <p
                        className={`text-base ${
                          isSuccessful ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        {`Units Sold: ${payload[0].value}`}
                      </p>
                      <p
                        className={`text-sm ${
                          isSuccessful ? "text-green-500" : "text-blue-500"
                        }`}
                      >
                        {isSuccessful ? "✨ Target Achieved" : "Target Pending"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
            />
            <Bar
              dataKey="unitsSold"
              name="Units Sold"
              radius={[8, 8, 0, 0]}
              className="transition-all duration-300"
            >
              {campData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="url(#blueGradient)"
                  filter="url(#shadow)"
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                />
              ))}
            </Bar>
            <text
              x="50%"
              y={10}
              textAnchor="middle"
              className="text-xs fill-pink-400"
            >
              Target: 35 units
            </text>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
