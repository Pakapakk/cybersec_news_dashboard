"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);

  const colorMap = {
    Microsoft: "#4F81BD",
    IBM: "#C0504D",
    GoDaddy: "#9BBB59",
    FireEye: "#8064A2",
    SolarWinds: "#4BACC6",
    Automattic: "#F79646",
    PaytmMall: "#92D050",
    ClickStudios: "#FFD700",
    Upstox: "#00B0F0",
    WhiteHatJr: "#7030A0",
    Edureka: "#FF69B4",
    Wiz: "#4682B4",
    MobiKwik: "#2F4F4F",
    BigBasket: "#DC143C",
    MatchGroup: "#00CED1",
    Dunzo: "#FF8C00",
    Natura: "#008000",
    ExperianSouthAfrica: "#8B0000",
  };

  useEffect(() => {
    async function fetchIndustryData() {
      try {
        const res = await fetch("/api/ontology-news");
        const data = await res.json();
        const industries = data.statistics.industryCounts || [];

        const formatted = industries.map((item) => ({
          label: item.industry,
          count: item.count,
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch industry data:", err);
      }
    }

    fetchIndustryData();
  }, []);

  const maxY = Math.max(...chartData.map((d) => d.count ?? 0), 0);
  const yTicks = Array.from({ length: maxY + 1 }, (_, i) => i);

  return (
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
        legends: { text: { fill: colors.grey[100] } },
        grid: { line: { stroke: colors.grey[600], strokeWidth: 1 } },
      }}
      margin={{ top: 50, right: 20, bottom: 80, left: 60 }}
      padding={0.3}
      layout="vertical"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      colorBy={(bar) => colorMap[bar.data.label] || "#8884d8"}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        legend: isDashboard ? undefined : "Industry",
        legendPosition: "middle",
        legendOffset: 60,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: (v) => v,
        tickValues: yTicks,
        legend: isDashboard ? undefined : "Number of Attacks",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      enableLabel={false}
      groupMode="grouped"
      role="application"
      barAriaLabel={(e) =>
        `${e.id}: ${e.formattedValue} in ${e.indexValue}`
      }
      tooltip={({ id, value, indexValue }) => (
        <div
          style={{
            background: colors.grey[800],
            padding: "5px 10px",
            borderRadius: "4px",
            color: "white",
            fontSize: "14px",
          }}
        >
          <strong>{indexValue}</strong>: {value}
        </div>
      )}
    />
  );
};

export default BarChart;
