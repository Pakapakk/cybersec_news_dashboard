"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";

const BarChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchAttackTypeData() {
            try {
                const res = await fetch("/api/cyber-news-stat");
                const data = await res.json();
                const attackTypes = data.attack_techniques || [];

                let formatted = attackTypes.map((item) => {
                    const label =
                        item._id === "other (techniques)" ||
                        item._id === "other"
                            ? "other"
                            : item._id;
                    return {
                        label,
                        count: item.count,
                    };
                });

                // Move "other" to the end
                formatted = formatted.sort((a, b) => {
                    if (a.label === "other") return 1;
                    if (b.label === "other") return -1;
                    return 0;
                });

                setChartData(formatted);
            } catch (err) {
                console.error("Failed to fetch attack type data:", err);
            }
        }

        fetchAttackTypeData();
    }, []);

    const maxY = Math.max(...chartData.map((d) => d.count ?? 0), 0);
    const step = Math.max(1, Math.ceil(maxY / 5));
    const yTicks = Array.from({ length: 6 }, (_, i) => i * step);

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
            valueScale={{ type: "linear", max: maxY + step }}
            indexScale={{ type: "band", round: true }}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            colorBy="indexValue"
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 45,
                legend: isDashboard ? undefined : "Attack Type",
                legendPosition: "middle",
                legendOffset: 60,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (v) => v,
                tickValues: yTicks,
                legend: isDashboard ? undefined : "Mentions",
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
