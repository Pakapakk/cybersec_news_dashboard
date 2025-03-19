"use client";

import { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { aggregateAttacksPerMonth } from "../aggregation/statistics";

const LineChart = ({ isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const rawData = aggregateAttacksPerMonth();

        if (rawData && Array.isArray(rawData) && rawData.length > 0) {
            const formattedData = [
                {
                    id: "Cyber Attacks",
                    color: colors.grey[300], // Light color for the line
                    data: rawData.map(({ label, value }) => ({
                        x: label,
                        y: value,
                    })),
                },
            ];

            if (formattedData.length !== chartData.length) {
                setChartData(formattedData);
            }
        }
    }, [chartData]);

    return (
        <ResponsiveLine
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
                grid: {
                    line: {
                        stroke: colors.grey[600],
                        strokeWidth: 1,
                    },
                },
                tooltip: {
                    container: {
                        background: colors.grey[800],
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                    },
                },
            }}
            colors={{ scheme: "nivo" }}
            margin={{ top: 50, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
            }}
            yFormat=" >-.2f"
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: "bottom",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: isDashboard ? undefined : "Month",
                legendOffset: 36,
                legendPosition: "middle",
            }}
            axisLeft={{
                orient: "left",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: isDashboard ? undefined : "Number of Attacks",
                legendOffset: -40,
                legendPosition: "middle",
            }}
            enableGridX={false}
            enableGridY={true}
            pointSize={8}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true} // 🔥 Enables smoother hover interactions like in BarChart
            tooltip={({ point }) => (
                <div
                    style={{
                        background: colors.grey[800],
                        padding: "5px 10px",
                        borderRadius: "4px",
                        color: "white",
                        fontSize: "14px",
                    }}
                >
                    <strong>{point.data.x}</strong>: {point.data.y} attacks
                </div>
            )}
        />
    );
};

export default LineChart;
