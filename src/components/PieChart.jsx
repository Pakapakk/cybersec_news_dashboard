"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";

const PieChart = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchSectors() {
            try {
                const res = await fetch("/api/cyber-news-stat");
                const data = await res.json();

                const sectors = data.sectors || [];

                const sorted = sectors.sort((a, b) => b.count - a.count);
                const top8 = sorted.slice(0, 8);
                const others = sorted.slice(8);

                const topData = top8
                    .filter((item) => item._id && typeof item.count === "number")
                    .map(({ _id, count }) => ({
                        id: _id,
                        label: _id,
                        value: count,
                    }));

                if (others.length > 0) {
                    const othersCount = others.reduce(
                        (sum, item) => sum + (item.count || 0),
                        0
                    );
                    topData.push({
                        id: "Others",
                        label: "Others",
                        value: othersCount,
                    });
                }

                setChartData(topData);
            } catch (err) {
                console.error("Failed to fetch sectors for pie chart:", err);
            }
        }

        fetchSectors();
    }, []);

    return (
        <ResponsivePie
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
            margin={{ top: 25, right: 40, bottom: 45, left: 40 }}

            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={colors.grey[100]}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            enableArcLabels={false}
            arcLabelsRadiusOffset={0.4}
            arcLabelsSkipAngle={7}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            tooltip={({ datum }) => (
                <div
                    style={{
                        background: colors.grey[800],
                        padding: "5px 10px",
                        borderRadius: "4px",
                        color: "white",
                        fontSize: "14px",
                    }}
                >
                    <strong>{datum.label}</strong>: {datum.value}
                </div>
            )}
        />
    );
};

export default PieChart;
