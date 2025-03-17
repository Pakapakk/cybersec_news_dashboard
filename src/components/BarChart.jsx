// "use client";

// import { useTheme } from "@mui/material";
// import { ResponsiveBar } from "@nivo/bar";
// import { tokens } from "../theme";
// import { mockBarData as data } from "../data/mockData";

// const BarChart = ({ isDashboard = false }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   return (
//     <ResponsiveBar
//       data={data}
//       theme={{
//         axis: {
//           domain: {
//             line: {
//               stroke: colors.grey[100],
//             },
//           },
//           legend: {
//             text: {
//               fill: colors.grey[100],
//             },
//           },
//           ticks: {
//             line: {
//               stroke: colors.grey[100],
//               strokeWidth: 1,
//             },
//             text: {
//               fill: colors.grey[100],
//             },
//           },
//         },
//         legends: {
//           text: {
//             fill: colors.grey[100],
//           },
//         },
//       }}
//       keys={["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]}
//       indexBy="country"
//       margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
//       padding={0.3}
//       valueScale={{ type: "linear" }}
//       indexScale={{ type: "band", round: true }}
//       colors={{ scheme: "nivo" }}
//       defs={[
//         {
//           id: "dots",
//           type: "patternDots",
//           background: "inherit",
//           color: "#38bcb2",
//           size: 4,
//           padding: 1,
//           stagger: true,
//         },
//         {
//           id: "lines",
//           type: "patternLines",
//           background: "inherit",
//           color: "#eed312",
//           rotation: -45,
//           lineWidth: 6,
//           spacing: 10,
//         },
//       ]}
//       borderColor={{
//         from: "color",
//         modifiers: [["darker", "1.6"]],
//       }}
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: isDashboard ? undefined : "country",
//         legendPosition: "middle",
//         legendOffset: 32,
//       }}
//       axisLeft={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: isDashboard ? undefined : "food",
//         legendPosition: "middle",
//         legendOffset: -40,
//       }}
//       enableLabel={false}
//       labelSkipWidth={12}
//       labelSkipHeight={12}
//       labelTextColor={{
//         from: "color",
//         modifiers: [["darker", 1.6]],
//       }}
//       legends={[
//         {
//           dataFrom: "keys",
//           anchor: "bottom-right",
//           direction: "column",
//           justify: false,
//           translateX: 120,
//           translateY: 0,
//           itemsSpacing: 2,
//           itemWidth: 100,
//           itemHeight: 20,
//           itemDirection: "left-to-right",
//           itemOpacity: 0.85,
//           symbolSize: 20,
//           effects: [
//             {
//               on: "hover",
//               style: {
//                 itemOpacity: 1,
//               },
//             },
//           ],
//         },
//       ]}
//       role="application"
//       barAriaLabel={(e) =>
//         `${e.id}: ${e.formattedValue} in country: ${e.indexValue}`
//       }
//     />
//   );
// };

// export default BarChart;

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { aggregateIndustries } from "../aggregation/statistics";

// Define industry-specific colors
// const industryColors = {
//     Hospitality: "#33FF57",
//     "Public Sector": "#581845",
//     Energy: "#FF8C00",
//     Technology: "#00CED1",
//     "Financial Services": "#228B22",
//     "Health Services": "#FF1493",
//     Education: "#DC143C",
// };

const industryColors = {
  "Real Estate": "#FF5733",
  "Hospitality": "#33FF57",
  "Media": "#5733FF",
  "Resources": "#FF33A1",
  "Retail": "#FFC300",
  "Law": "#C70039",
  "Industrial Manufacturing": "#900C3F",
  "Public Sector": "#581845",
  "Energy": "#FF8C00",
  "Technology": "#00CED1",
  "Transportation": "#4682B4",
  "Telecommunications": "#8A2BE2",
  "Financial Services": "#228B22",
  "Health Services": "#FF1493",
  "Life Sciences": "#20B2AA",
  "Consumer Goods": "#B8860B",
  "Mobility": "#9932CC",
  "Education": "#DC143C",
};

const industryKeys = Object.keys(industryColors);
// console.log(industryKeys)

const BarChart = ({ data, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState([]);
    data = aggregateIndustries(data);

    useEffect(() => {
        // Prevent reprocessing if the data hasn't changed
        if (data && Array.isArray(data) && data.length > 0) {
            // console.log("[DEBUG] Raw Data Received:", data);

            const processedData = aggregateIndustries(data).reduce(
                (acc, entry) => {
                    const { label, value } = entry;
                    if (!acc[label]) {
                        acc[label] = { label };
                    }
                    acc[label][label] = value;
                    return acc;
                },
                {}
            );

            const formattedData = Object.values(processedData);

            if (formattedData.length !== chartData.length) {
                // console.log("[DEBUG] Processed Chart Data:", formattedData);
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
            }}
            keys={industryKeys}
            indexBy="label"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            // colors={({ label }) => industryColors[label].value || "#CCCCCC"}
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
            legends={[
                {
                    dataFrom: "keys",
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: "left-to-right",
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                        {
                            on: "hover",
                            style: { itemOpacity: 1 },
                        },
                    ],
                },
            ]}
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
