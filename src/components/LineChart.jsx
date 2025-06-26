"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { tokens } from "../theme";

export default function LineChart({ isDashboard = false, monthlyCounts = [] }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);
  const [tickValues, setTickValues] = useState([]);

  useEffect(() => {
  if (!Array.isArray(monthlyCounts)) return;

  const validData = monthlyCounts
    .filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        typeof entry.label === "string" &&
        typeof entry.value === "number" &&
        !isNaN(entry.value)
    )
    .sort((a, b) => {
      const [mA, yA] = a.label.split("-").map(Number);
      const [mB, yB] = b.label.split("-").map(Number);
      return new Date(yA, mA - 1) - new Date(yB, mB - 1);
    });

  if (validData.length === 0) {
    setChartData([]);
    setTickValues([]);
    return;
  }

  const dataPoints = validData.map(({ label, value }) => ({
    x: label,
    y: Math.round(value), // make sure value is integer
  }));

  const maxY = Math.max(...dataPoints.map((d) => d.y), 0);

  let step;
  if (maxY <= 10) step = 1;
  else if (maxY <= 50) step = 5;
  else if (maxY <= 100) step = 10;
  else step = 20;

  // Round maxY up to nearest multiple of step
  const adjustedMaxY = Math.ceil(maxY / step) * step;

  const ticks = [];
  for (let i = 0; i <= adjustedMaxY; i += step) {
    ticks.push(i);
  }


  setTickValues(ticks);
  setChartData([
    {
      id: "Cyber Attacks",
      color: colors.grey[300],
      data: dataPoints,
    },
  ]);
}, [monthlyCounts, theme.palette.mode]);

if (!chartData.length) return null;


  return (
    <ResponsiveLine
      data={chartData}
      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          ticks: { text: { fill: colors.grey[100] } },
        },
        grid: { line: { stroke: colors.grey[600], strokeWidth: 1 } },
        tooltip: {
          container: {
            background: colors.grey[800],
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
          },
        },
      }}
      colors={{ scheme: "nivo" }}
      margin={{ top: 50, right: 20, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
          type: "linear",
          min: 0,
          max: Math.max(...tickValues), // use actual max instead of "auto"
          stacked: false,
          tickValues: tickValues,
        }}
      axisBottom={{
        tickRotation: -45,
        legend: isDashboard ? undefined : "Month‑Year",
        legendPosition: "middle",
        legendOffset: 36,
      }}
      axisLeft={{
        legend: isDashboard ? undefined : "Number of Attacks",
        legendPosition: "middle",
        legendOffset: -40,
        tickValues: tickValues,
        format: (value) => Number(value).toFixed(0), // Force integer labels
      }}
      enableGridX={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      useMesh={true}
      tooltip={({ point }) => {
        if (!point?.data?.x || point.data.y === undefined) return null;
        return (
          <div
            style={{
              background: colors.grey[800],
              padding: "5px 10px",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            <strong>{point.data.x}</strong>: {point.data.y} attacks
          </div>
        );
      }}
    />
  );
}
