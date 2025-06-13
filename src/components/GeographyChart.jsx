"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";
import TopicPopup from "./TopicPopup";

// Country Name to ISO-3 Code Mapping
const countryNameToISO3 = {
  italy: "ITA",
  germany: "DEU",
  uk: "GBR",
  "united kingdom": "GBR",
  "great britain": "GBR",
  london: "GBR",
  us: "USA",
  "u.s.": "USA",
  "united states": "USA",
  "united states of america": "USA",
  america: "USA",
  china: "CHN",
  "north korea": "PRK",
  "south korea": "KOR",
  russia: "RUS",
  japan: "JPN",
  india: "IND",
  australia: "AUS",
  canada: "CAN",
  ukraine: "UKR",
  belarus: "BLR",
  brazil: "BRA",
  france: "FRA",
  netherlands: "NLD",
  israel: "ISR",
  singapore: "SGP",
};

export default function GeographyChart({ isDashboard = false }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        const res = await fetch("/api/cyber-news-stat");
        const data = await res.json();

        if (data?.countries) {
          const formatted = data.countries
            .map(({ _id, count }) => {
              const key = _id.toLowerCase().trim();
              const iso3 = countryNameToISO3[key];
              return iso3
                ? { id: iso3, value: count, label: _id }
                : null;
            })
            .filter(Boolean);

          setChartData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch country stats", err);
      }
    }
    fetchCountryStats();
  }, []);

  const handleCountryClick = (feature) => {
    const name = feature.properties.name;
    setSelectedCountry(name);
    setPopupOpen(true);
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
        onClick={handleCountryClick}
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
        legends={!isDashboard ? [{
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
            { on: "hover", style: { itemTextColor: "#ffffff", itemOpacity: 1 } }
          ],
        }] : undefined}
      />

      <TopicPopup
        topic={selectedCountry}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}
