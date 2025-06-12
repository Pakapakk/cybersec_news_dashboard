"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import TopicPopup from "./TopicPopup";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    async function fetchAttackTypeData() {
      const res = await fetch("/api/cyber-news-stat");
      const data = await res.json();
      const arr = data.attack_techniques || [];
      let formatted = arr.map(item => ({
        label: item._id === "other (techniques)" || item._id === "other" ? "other" : item._id,
        count: item.count
      })).sort((a, b) => (a.label === "other" ? 1 : b.label === "other" ? -1 : 0));
      setChartData(formatted);
    }
    fetchAttackTypeData();
  }, []);

  const maxY = Math.max(...chartData.map(d => d.count), 0);
  const step = Math.max(1, Math.ceil(maxY / 5));
  const yTicks = Array.from({ length: 6 }, (_, i) => i * step);

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
            ticks: { line: { stroke: colors.grey[100], strokeWidth: 1 }, text: { fill: colors.grey[100] } }
          },
          legends: { text: { fill: colors.grey[100] } },
          grid: { line: { stroke: colors.grey[600], strokeWidth: 1 } }
        }}
        margin={{ top: 50, right: 20, bottom: 80, left: 60 }}
        padding={0.3}
        layout="vertical"
        valueScale={{ type: "linear", max: maxY + step }}
        indexScale={{ type: "band", round: true }}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        colorBy="indexValue"
        axisBottom={{
          tickSize: 5, tickPadding: 5, tickRotation: 45,
          legend: isDashboard ? undefined : "Attack Type",
          legendPosition: "middle",
          legendOffset: 60
        }}
        axisLeft={{
          tickSize: 5, tickPadding: 5, tickRotation: 0, format: v => v,
          tickValues: yTicks,
          legend: isDashboard ? undefined : "Mentions",
          legendPosition: "middle",
          legendOffset: -40
        }}
        enableLabel={false}
        groupMode="grouped"
        role="application"
        barAriaLabel={e => `${e.id}: ${e.formattedValue} in ${e.indexValue}`}
        tooltip={({ value, indexValue }) => (
          <div style={{
            background: colors.grey[800],
            padding: "5px 10px",
            borderRadius: "4px",
            color: "white",
            fontSize: "14px"
          }}>
            <strong>{indexValue}</strong>: {value}
          </div>
        )}
        onClick={bar => {
          setSelectedTopic(bar.data.label);
          setPopupOpen(true);
        }}
      />

      <TopicPopup
        topic={selectedTopic}
        open={isPopupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
};

export default BarChart;
