"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { aggregateIndustries } from "../aggregation/statistics";

console.log(aggregateIndustries);

const industryKeys = [
  "Real Estate",
  "Hospitality",
  "Media",
  "Resources",
  "Retail",
  "Law",
  "Industrial Manufacturing",
  "Public Sector",
  "Energy",
  "Technology",
  "Transportation",
  "Telecommunications",
  "Financial Services",
  "Health Services",
  "Life Sciences",
  "Consumer Goods",
  "Mobility",
  "Education",
];

const BarChart = ({ data, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);
  data = aggregateIndustries(data);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const processedData = aggregateIndustries(data).reduce((acc, entry) => {
        const { label, value } = entry;
        if (!acc[label]) {
          acc[label] = { label };
        }
        acc[label][label] = value;
        return acc;
      }, {});

      const formattedData = Object.values(processedData);

      if (formattedData.length !== chartData.length) {
        setChartData(formattedData);
      }
    }
  }, [data, chartData]);

  return (
    <ResponsiveBar
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        grid: {
          line: {
            stroke: colors.grey[600],
            strokeWidth: 1,
          },
        },
      }}
      keys={industryKeys}
      indexBy="label"
      margin={{ top: 50, right: 20, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      borderColor={{ from: "color", modifiers: [["darker", "1.6"]] }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        legend: isDashboard ? undefined : "Industry",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Number of Attacks",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      enableLabel={false}
      role="application"
      barAriaLabel={(e) =>
        `${e.id}: ${e.formattedValue} in Industry: ${e.indexValue}`
      }
      tooltip={(e) => (
        <div
          style={{
            background: colors.grey[800],
            padding: "5px 10px",
            borderRadius: "4px",
            color: "white",
            fontSize: "14px",
          }}
        >
          <strong>{e.indexValue}</strong>: {e.formattedValue}
        </div>
      )}
    />
  );
};

export default BarChart;
