// BarChart.jsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import TopicPopup from "./TopicPopup";

export default function BarChart({
  isDashboard = false,
  attackNewsMap = {},
  onBarClick,
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);

  // Transform attackNewsMap → array of { label, count, articles }
  const chartData = Object.entries(attackNewsMap).map(([label, info]) => ({
    label,                 // e.g. "DDoS"
    count: info.count,     // numeric count
    articles: info.articles,
  }));

  const maxY = Math.max(...chartData.map(d => d.count), 0);
  const step = Math.max(1, Math.ceil(maxY / 5));
  const yTicks = Array.from({ length: 6 }, (_, i) => i * step);

  const handleClick = bar => {
    const { label, articles } = bar.data;
    setSelectedTopic(label);
    setArticles(articles);
    setPopupOpen(true);
    onBarClick?.(label);
  };

  return (
    <>
      <ResponsiveBar
        data={chartData}
        keys={["count"]}
        indexBy="label"
        theme={{
          axis: {
            domain: { line: { stroke: colors.grey[100] } },
            legend: { text: { fill: colors.grey[100] } },
            ticks: {
              line: { stroke: colors.grey[100], strokeWidth: 1 },
              text: { fill: colors.grey[100] },
            },
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
        margin={{ top: 50, right: 20, bottom: 80, left: 60 }}
        padding={0.3}
        layout="vertical"
        valueScale={{ type: "linear", max: maxY + step }}
        indexScale={{ type: "band", round: true }}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        colorBy="indexValue"
        axisBottom={{
          tickRotation: 45,
          legend: isDashboard ? undefined : "Attack Type",
          legendPosition: "middle",
          legendOffset: 60,
        }}
        axisLeft={{
          tickValues: yTicks,
          legend: isDashboard ? undefined : "Mentions",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        enableLabel={false}
        tooltip={({ value, indexValue }) => (
          <div
            style={{
              background: colors.grey[800],
              padding: "5px 10px",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            <strong>{indexValue}</strong>: {value}
          </div>
        )}
        onClick={handleClick}
      />

      {/* <TopicPopup
        topic={selectedTopic}
        articles={articles}
        open={isPopupOpen}
        onClose={() => setPopupOpen(false)}
      /> */}
    </>
  );
}
