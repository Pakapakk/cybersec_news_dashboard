"use client";

import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "@/theme";
import {
  aggregateAttacksPerMonth,
  getMostUsedAttackType,
  getMostTargetedIndustry,
  getLatestAttacks,
} from "../aggregation/statistics";
import Header from "@/components/Header";
import LineChart from "@/components/LineChart";
import GeographyChart from "@/components/GeographyChart";
import BarChart from "@/components/BarChart";
import StatBox from "@/components/StatBox";
import PieChart from "@/components/PieChart";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Ontology-based state
  const [newsCount, setNewsCount] = useState(0);
  const [topAttackTechniques, setTopAttackTechniques] = useState([]);
  const [topOntologyAttackers, setTopOntologyAttackers] = useState([]);
  const [countryCounts, setCountryCounts] = useState([]);
  const [topTargetCountries, setTopTargetCountries] = useState([]);

  useEffect(() => {
    async function fetchOntologyStats() {
      try {
        const res = await fetch("/api/ontology-news");
        const data = await res.json();

        const techniques = data.statistics.attackTypeClassCounts?.slice(0, 5) || [];
        const attackers = data.statistics.threatActorCounts?.slice(0, 5) || [];
        const countries = data.statistics.countryCounts || [];

        setNewsCount(data.statistics.newsCount || 0);
        setTopAttackTechniques(techniques);
        setTopOntologyAttackers(attackers);
        setCountryCounts(countries);

        const topCountries = countries
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map(({ country, count }) => ({
            label: country,
            value: count,
          }));
        setTopTargetCountries(topCountries);
      } catch (err) {
        console.error("Failed to fetch ontology stats:", err);
      }
    }

    fetchOntologyStats();
  }, []);

  // Local data (static or precomputed)
  const totalAttacks = aggregateAttacksPerMonth().reduce(
    (sum, item) => sum + item.value,
    0
  );
  const mostUsedAttackType = getMostUsedAttackType()?.label || "N/A";
  const mostTargetedIndustry = getMostTargetedIndustry()?.label || "N/A";
  const latestAttacks = getLatestAttacks();

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
          <StatBox
            title="Total Attacks"
            subtitle={newsCount.toLocaleString()}
          />
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox title="Most Techniques" subtitle={mostUsedAttackType} />
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="Most Targeted Industry"
            subtitle={mostTargetedIndustry}
          />
        </Box>

        {/* Row 2 */}
        <Box
          gridColumn="span 5"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Target Industries
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
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Target Countries
          </Typography>
          <Box display="flex" height="200px" justifyContent="space-between">
            <Box flex="1">
              <GeographyChart data={countryCounts} isDashboard={true} />
            </Box>
            <Box width="30%" paddingLeft="20px">
              <Typography
                variant="h6"
                fontWeight="600"
                sx={{ marginBottom: "10px" }}
              >
                Top 3 Target Countries
              </Typography>
              {topTargetCountries.map((country, index) => (
                <Typography
                  key={index}
                  color={colors.grey[100]}
                  sx={{ marginBottom: "8px" }}
                >
                  {index + 1}. {country.label} ({country.value})
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Row 2.5 */}
        <Box
          gridColumn="span 2"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Top 5 Cyber Attack Techniques
          </Typography>
          <Box>
            {topAttackTechniques.map((tech, index) => (
              <Typography
                key={index}
                color={colors.grey[100]}
                sx={{ marginBottom: "10px" }}
              >
                {index + 1}. {tech.attackType} ({tech.count})
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Row 3 */}
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
            <Typography
              variant="h5"
              fontWeight="600"
              color={colors.grey[100]}
            >
              Attack Statistics
            </Typography>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Attack Types
          </Typography>
          <Box height="290px" mt="-20px" paddingTop={3}>
            <PieChart />
          </Box>
        </Box>

        {/* Top Attackers */}
        <Box
          gridColumn="span 2"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Top 5 Attackers
          </Typography>
          <Box>
            {topOntologyAttackers.map((attacker, index) => (
              <Typography
                key={index}
                color={colors.grey[100]}
                sx={{ marginBottom: "10px" }}
              >
                {index + 1}. {attacker.actor} ({attacker.count})
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
