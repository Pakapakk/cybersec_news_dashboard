"use client";

import { useState } from "react";
import { useTheme } from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { tokens } from "../theme";
// import TopicPopup from "./TopicPopup";

export default function PieChart({
  isDashboard = false,
  sectors = [],            // either [{_id, count, articles}] or { label: {count, articles}, ... }
  onSliceClick,
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [articles, setArticles] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  // Normalize sectors into array of {id, value, articles}
  const sectorArray = Array.isArray(sectors)
    ? sectors.map(item => ({
        id: item._id,
        label: item._id,
        value: item.count,
        articles: item.articles || [],
      }))
    : Object.entries(sectors).map(([id, info]) => ({
        id,
        label: id,
        value: info.count,
        articles: info.articles || [],
      }));

  // Sort + pick top 7 + merge the rest into 'Others'
  const sorted = [...sectorArray].sort((a, b) => b.value - a.value);
  const top7 = sorted.slice(0, 7);
  const others = sorted.slice(7);
  const chartData = [
    ...top7,
    ...(others.length
      ? [{
          id: "Others",
          label: "Others",
          value: others.reduce((sum, i) => sum + i.value, 0),
          articles: others.flatMap(i => i.articles),
        }]
      : [])
  ];

  const handleClick = datum => {
    setSelectedSlice(datum.id);
    setArticles(datum.articles || []);
    setPopupOpen(true);
    onSliceClick?.(datum.id);
  };

  return (
    <>
      <ResponsivePie
        data={chartData}
        keyBy="id"
        label={({ datum }) => datum.label}
        onClick={handleClick}
        theme={{
          legends: { text: { fill: colors.grey[100] } },
          tooltip: { container: { background: colors.grey[800], color: "#fff" } },
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
        tooltip={({ datum }) => (
          <div
            style={{
              background: colors.grey[800],
              padding: 5,
              borderRadius: 4,
              color: "#fff",
              fontSize: "14px",
            }}
          >
            <strong>{datum.label}</strong>: {datum.value}
          </div>
        )}
      />
      {/* <TopicPopup
        topic={selectedSlice}
        articles={articles}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
      /> */}
    </>
  );
}
