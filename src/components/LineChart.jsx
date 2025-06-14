"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { tokens } from "../theme";

export default function LineChart({ isDashboard = false, monthlyCounts = [] }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const sorted = [...monthlyCounts].sort((a, b) => {
      const [mA, yA] = a.label.split('-').map(Number);
      const [mB, yB] = b.label.split('-').map(Number);
      return new Date(yA, mA - 1) - new Date(yB, mB - 1);
    });

    const dataPoints = sorted.map(({ label, value }) => ({ x: label, y: value }));
    setChartData([{ id: "Cyber Attacks", color: colors.grey[300], data: dataPoints }]);
  }, [monthlyCounts, theme.palette.mode]);

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
      yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
      curve="catmullRom"
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
      }}
      enableGridX={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      useMesh={true}
      tooltip={({ point }) => (
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
      )}
    />
  );
}
