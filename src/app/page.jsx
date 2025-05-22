"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "@/theme";
import {
    aggregateAttacksPerMonth,
    getMostUsedAttackType,
    getMostTargetedIndustry,
    getTopAttackers,
    getTopTargetCountries,
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

    // Fetch statistics dynamically
    const totalAttacks = aggregateAttacksPerMonth().reduce(
        (sum, item) => sum + item.value,
        0
    );
    const mostUsedAttackType = getMostUsedAttackType()?.label || "N/A";
    const mostTargetedIndustry = getMostTargetedIndustry()?.label || "N/A";
    const topAttackers = getTopAttackers();
    const latestAttacks = getLatestAttacks();
    const topTargetCountries = getTopTargetCountries();

    return (
        <Box m="20px" marginTop={5}>
            {/* HEADER */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >
                <Header title="DASHBOARD" subtitle="Cyber Attack Statistics" />
            </Box>

            {/* GRID & CHARTS */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="140px"
                gap="20px"
            >
                {/* ROW 1 - STATISTICS BOXES */}
                <Box
                    gridColumn="span 4"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <StatBox
                        title="Total Attacks"
                        subtitle={totalAttacks.toLocaleString()}
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
                        title="Most Techniques"
                        subtitle={mostUsedAttackType}
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
                        title="Most Targeted Industry"
                        subtitle={mostTargetedIndustry}
                    />
                </Box>

                {/* ROW 2 - BAR CHART & GEO MAP */}
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
                    <Box
                        display="flex"
                        height="200px"
                        justifyContent="space-between"
                    >
                        <Box flex="1">
                            <GeographyChart isDashboard={true} />
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
                                    {index + 1}. {country.label} (
                                    {country.value})
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* LATEST 5 CYBER ATTACKS */}
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
                        Latest 5 Cyber Attacks
                    </Typography>
                    <Box>
                        {latestAttacks.map((attack, index) => (
                            <Typography
                                key={index}
                                color={colors.grey[100]}
                                sx={{ marginBottom: "10px" }}
                            >
                                {index + 1}. {attack.attackTypes.join(", ")}
                            </Typography>
                        ))}
                    </Box>
                </Box>

                {/* ROW 3 - LINE CHART & PIE CHART */}
                <Box
                    gridColumn="span 6"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                >
                    <Box
                        mt="25px"
                        p="0 30px"
                        display="flex "
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                fontWeight="600"
                                color={colors.grey[100]}
                            >
                                Attack Statistics
                            </Typography>
                        </Box>
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

                {/* TOP 5 ATTACKERS */}
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
                        {topAttackers.map((attacker, index) => (
                            <Typography
                                key={index}
                                color={colors.grey[100]}
                                sx={{ marginBottom: "10px" }}
                            >
                                {index + 1}. {attacker.label} ({attacker.value})
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;