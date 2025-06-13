"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";

export default function PieChart({ isDashboard = false, onSliceClick }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/cyber-news-stat");
      const data = await res.json();
      const arr = (data.sectors || []).sort((a, b) => b.count - a.count);

      // Combine by id in case there are duplicates
      const map = new Map();
      arr.forEach(item => {
        const id = item._id;
        if (!id) return;
        map.set(id, (map.get(id) || 0) + item.count);
      });

      const aggregated = Array.from(map.entries())
        .map(([id, value]) => ({ id, label: id, value }))
        .sort((a, b) => b.value - a.value);

      // Show top 6 and group rest into Others
      const top7 = aggregated.slice(0, 7);
      const others = aggregated.slice(7);
      const chartArray = [
        ...top7,
        ...(others.length
          ? [{
              id: "Others",
              label: "Others",
              value: others.reduce((sum, it) => sum + it.value, 0)
            }]
          : [])
      ];

      setChartData(chartArray);
    })();
  }, []);

  return (
    <ResponsivePie
      data={chartData}
      keyBy="id"
      label={({ datum }) => datum.label}
      onClick={({ id, label }) => onSliceClick?.(label)}
      theme={{
        legends: { text: { fill: colors.grey[100] } },
        axis: { domain: { line: { stroke: colors.grey[100] } } },
      }}
      margin={{ top: 25, right: 40, bottom: 45, left: 40 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      tooltip={({ datum }) => (
        <div
          style={{
            background: colors.grey[800],
            padding: 5,
            borderRadius: 4,
            color: "#fff",
            fontSize: "14px"
          }}
        >
          <strong>{datum.label}</strong>: {datum.value}
        </div>
      )}
    />
  );
}
