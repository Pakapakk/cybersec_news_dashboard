"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";
import { tokens } from "../theme";


// Country Name to ISO-3 Code Mapping
const countryNameToISO3 = {
  Italy: "ITA",
  Germany: "DEU",
  UK: "GBR",
  "United Kingdom": "GBR",
  India: "IND",
  China: "CHN",
  Russia: "RUS",
  Japan: "JPN",
  "South Korea": "KOR",
  Australia: "AUS",
  France: "FRA",
  USA: "USA",
  "United States": "USA",
  "United States of America": "USA",
  Brazil: "BRA",
  Canada: "CAN",
  Netherlands: "NLD",
  Israel: "ISR",
  Singapore: "SGP",
};

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        const res = await fetch("../api/ontology-news");
        const { statistics } = await res.json();

        if (statistics?.countryCounts) {
          const formatted = statistics.countryCounts
            .map(({ country, count }) => ({
              id: countryNameToISO3[country] || country,
              value: count,
            }))
            .filter((d) => d.id);

          setChartData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch country stats", err);
      }
    }

    fetchCountryStats();
  }, []);

  return (
    <ResponsiveChoropleth
      data={chartData}
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
      }}
      features={geoFeatures.features}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      domain={[0, Math.max(...chartData.map((d) => d.value), 1000000)]}
      colors="nivo"
      unknownColor="#666666"
      label="properties.name"
      valueFormat=".2s"
      projectionScale={isDashboard ? 40 : 150}
      projectionTranslation={isDashboard ? [0.49, 0.6] : [0.5, 0.5]}
      projectionRotation={[0, 0, 0]}
      borderWidth={1.5}
      borderColor="#ffffff"
      tooltip={({ feature }) => (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            color: "#ffffff",
            padding: "8px",
            borderRadius: "5px",
            fontSize: "14px",
          }}
        >
          <strong>{feature.properties.name}</strong>
          <br />
          Attacks: {feature.value ? feature.value.toLocaleString() : "N/A"}
        </div>
      )}
      legends={
        !isDashboard
          ? [
              {
                anchor: "bottom-left",
                direction: "column",
                justify: true,
                translateX: 20,
                translateY: -100,
                itemsSpacing: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemDirection: "left-to-right",
                itemTextColor: colors.grey[100],
                itemOpacity: 0.85,
                symbolSize: 18,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#ffffff",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]
          : undefined
      }
    />
  );
};

export default GeographyChart;