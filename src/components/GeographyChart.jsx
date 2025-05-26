"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";
import { tokens } from "../theme";

// Country Name to ISO-3 Code Mapping
const countryNameToISO3 = {
    italy: "ITA",
    germany: "DEU",
    uk: "GBR",
    "united kingdom": "GBR",
    "great britain": "GBR",
    london: "GBR", // location, but map anyway
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

const GeographyChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchCountryStats() {
            try {
                const res = await fetch("/api/cyber-news-stat");
                const data = await res.json();

                if (data?.countries) {
                    const formatted = data.countries
                        .map(({ _id, count }) => {
                            const name = _id.toLowerCase().trim(); // normalize name
                            const iso3 = countryNameToISO3[name];
                            return iso3 ? { id: iso3, value: count } : null;
                        })
                        .filter(Boolean); // remove nulls

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
                    Attacks:{" "}
                    {feature.value ? feature.value.toLocaleString() : "N/A"}
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
