"use client";

import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "@/theme";
import Header from "@/components/Header";
import LineChart from "@/components/LineChart";
import GeographyChart from "@/components/GeographyChart";
import BarChart from "@/components/BarChart";
import StatBox from "@/components/StatBox";
import PieChart from "@/components/PieChart";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [newsCount, setNewsCount] = useState(0);
  const [topAttackTechniques, setTopAttackTechniques] = useState([]);
  const [topAttackers, setTopAttackers] = useState([]);
  const [countryCounts, setCountryCounts] = useState([]);
  const [topTargetCountries, setTopTargetCountries] = useState([]);
  const [mostUsedAttackType, setMostUsedAttackType] = useState({ label: "N/A", count: 0 });
  const [mostTargetedSector, setMostTargetedSector] = useState({ label: "N/A", count: 0 });


  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/cyber-news-stat");
        const data = await res.json();

        setNewsCount(data.newsCount || 0);
        setTopAttackTechniques(data.top5AttackTechniques || []);
        setTopAttackers(data.top5Attackers || []);
        setCountryCounts(data.countries || []);
        setMostUsedAttackType(data.mostUsedAttackType || { label: "N/A", count: 0 });
        setMostTargetedSector(data.mostTargetedSector || { label: "N/A", count: 0 });


        const topCountries = (data.countries || [])
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map(({ _id, count }) => ({
            label: _id,
            value: count,
          }));
        setTopTargetCountries(topCountries);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    }

    fetchStats();
  }, []);

  return (
    <Box m="20px" marginTop={5}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Cyber Attack Statistics" />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* Row 1 */}
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox title="Total Attacks" subtitle={newsCount.toLocaleString()} />
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
  title="Most Technique"
  subtitle={`${mostUsedAttackType.label} (${mostUsedAttackType.count})`}
/>
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
  title="Most Mentioned Sector"
  subtitle={`${mostTargetedSector.label} (${mostTargetedSector.count})`}
/>
        </Box>

        {/* Row 2 */}
        <Box
          gridColumn="span 5"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          // sx={{ height: "320px" }}
        >
          <Typography variant="h4" fontWeight="600" sx={{ padding: "30px 30px 0 30px" }}>
            Attack Types
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        <Box
          gridColumn="span 5"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography variant="h4" fontWeight="600" sx={{ marginBottom: "15px" }}>
            Mentioned Countries
          </Typography>
          <Box display="flex" height="200px" justifyContent="space-between">
            <Box flex="1">
              <GeographyChart data={countryCounts} isDashboard={true} />
            </Box>
            <Box width="30%" paddingLeft="20px">
              <Typography variant="h4" fontWeight="600" sx={{ marginBottom: "10px" }}>
                Top 3 Mentioned Countries
              </Typography>
              {topTargetCountries.map((country, index) => (
                <Typography
                  key={index}
                  color={colors.grey[100]}
                  sx={{ marginBottom: "8px"}}
                >
                  {index + 1}. {country.label} ({country.value})
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Row 2.5 - Top Techniques */}
        <Box
          gridColumn="span 2"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography variant="h4" fontWeight="600" sx={{ marginBottom: "15px" }}>
            Top 5 Techniques
          </Typography>
          <Box>
            {topAttackTechniques.map((tech, index) => (
              <Typography
                key={index}
                color={colors.grey[100]}
                sx={{ marginBottom: "10px" }}
              >
                {index + 1}. {tech._id} ({tech.count})
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Row 3 - Monthly line chart */}
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
              Monthly Attack Statistics
            </Typography>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        {/* Row 3 - Pie chart */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h4" fontWeight="600">
            Mentioned Sectors
          </Typography>
          <Box height="290px" mt="-20px" paddingTop={3}>
            <PieChart />
          </Box>
        </Box>

        {/* Row 3 - Top attackers */}
        <Box
          gridColumn="span 2"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography variant="h4" fontWeight="600" sx={{ marginBottom: "15px" }}>
            Top 5 Attackers
          </Typography>
          <Box>
            {topAttackers.map((attacker, index) => (
              <Typography
                key={index}
                color={colors.grey[100]}
                sx={{ marginBottom: "10px" }}
              >
                {index + 1}. {attacker._id} ({attacker.count})
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
