"use client";

import { useState } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";
import TopicPopup from "./TopicPopup";

// More complete name-to-ISO mapping
const countryNameToISO3 = {
  italy: "ITA", germany: "DEU", uk: "GBR", "united kingdom": "GBR",
  "great britain": "GBR", london: "GBR", us: "USA", "u.s.": "USA",
  "united states": "USA", "united states of america": "USA",
  america: "USA", china: "CHN", "north korea": "PRK",
  "south korea": "KOR", russia: "RUS", japan: "JPN",
  india: "IND", australia: "AUS", canada: "CAN",
  ukraine: "UKR", belarus: "BLR", brazil: "BRA", france: "FRA",
  netherlands: "NLD", israel: "ISR", singapore: "SGP",
};

export default function GeographyChart({
  isDashboard = false,
  countryNewsMap = {},
  onCountryClick,
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [articles, setArticles] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const chartData = Object.entries(countryNewsMap)
    .map(([country, info]) => {
      const iso = countryNameToISO3[country.trim().toLowerCase()];
      if (!iso) return null;
      return {
        id: iso,
        value: info.count,
        label: country,
        articles: info.articles || [],
      };
    })
    .filter(Boolean);

  // Map iso code → data entry for fast reverse lookup
  const isoToEntry = chartData.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  // On-click, match via feature.id and lookup via isoToEntry
  const handleClick = feature => {
    const iso = feature.id;
    const entry = isoToEntry[iso];
    if (!entry) return;

    setSelectedCountry(entry.label);
    setArticles(entry.articles);
    setPopupOpen(true);
    if (onCountryClick) onCountryClick(entry.label);
  };

  return (
    <>
      <ResponsiveChoropleth
        data={chartData}
        features={geoFeatures.features}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        domain={[0, Math.max(...chartData.map(d => d.value), 1)]}
        colors="nivo"
        unknownColor="#666666"
        label="properties.name"
        projectionScale={isDashboard ? 40 : 150}
        projectionTranslation={isDashboard ? [0.49, 0.6] : [0.5, 0.5]}
        borderWidth={1.5}
        borderColor="#ffffff"
        tooltip={({ feature }) => (
          <div style={{
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "8px",
            borderRadius: "5px",
            fontSize: "14px",
          }}>
            <strong>{feature.properties.name}</strong><br/>
            Attacks: {feature.value?.toLocaleString() || "N/A"}
          </div>
        )}
        onClick={handleClick}
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
        legends={!isDashboard
          ? [
              {
                anchor: "bottom-left",
                direction: "column",
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
                    style: { itemTextColor: "#ffffff", itemOpacity: 1 },
                  },
                ],
              }
            ]
          : undefined}
      />

      <TopicPopup
        topic={selectedCountry}
        articles={articles}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}
