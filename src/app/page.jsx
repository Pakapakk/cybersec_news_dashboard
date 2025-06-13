"use client";

import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, useTheme } from "@mui/material";
import { tokens } from "@/theme";
import Header from "@/components/Header";
import LineChart from "@/components/LineChart";
import GeographyChart from "@/components/GeographyChart";
import BarChart from "@/components/BarChart";
import StatBox from "@/components/StatBox";
import PieChart from "@/components/PieChart";
import TopicPopup from "@/components/TopicPopup";

export default function Dashboard() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [newsCount, setNewsCount] = useState(0);
    const [topAttackTechniques, setTopAttackTechniques] = useState([]);
    const [topAttackers, setTopAttackers] = useState([]);
    const [countryCounts, setCountryCounts] = useState([]);
    const [topTargetCountries, setTopTargetCountries] = useState([]);
    const [mostUsedAttackType, setMostUsedAttackType] = useState({ label: "N/A", count: 0 });
    const [mostTargetedSector, setMostTargetedSector] = useState({ label: "N/A", count: 0 });

    const [timeValue, setTimeValue] = useState("");
    const [timeUnit, setTimeUnit] = useState("months");

    const fetchStats = async () => {
        const tf = timeValue ? `${timeValue}${timeUnit.charAt(0)}` : "";
        const url = tf ? `/api/cyber-news-stat?tf=${tf}` : "/api/cyber-news-stat";
        const res = await fetch(url);
        const data = await res.json();

        setNewsCount(data.newsCount);
        setTopAttackTechniques(data.top5AttackTechniques);
        setTopAttackers(data.top5Attackers);
        setCountryCounts(data.countries);

        // Handle array format for mostUsedAttackType
        if (Array.isArray(data.mostUsedAttackType) && data.mostUsedAttackType.length > 0) {
            const [{ _id, count }] = data.mostUsedAttackType;
            setMostUsedAttackType({ label: _id, count });
        } else {
            setMostUsedAttackType({ label: "N/A", count: 0 });
        }

        // Handle array format for mostTargetedSector
        if (Array.isArray(data.mostTargetedSector) && data.mostTargetedSector.length > 0) {
            const [{ _id, count }] = data.mostTargetedSector;
            setMostTargetedSector({ label: _id, count });
        } else {
            setMostTargetedSector({ label: "N/A", count: 0 });
        }

        // Top 3 countries for display
        const top3 = (data.countries || [])
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(({ _id, count }) => ({ label: _id, value: count }));
        setTopTargetCountries(top3);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            fetchStats();
        }
    };

    const [popupTopic, setPopupTopic] = useState(null);
    const [open, setOpen] = useState(false);

    const handleTopicClick = (topic) => {
        setPopupTopic(topic);
        setOpen(true);
    };

    const closePopup = () => {
        setPopupTopic(null);
        setOpen(false);
    };

    return (
        <Box mb={4} mt={3} mx={2}>
            <Box display="flex" justifyContent="space-between">
                <Header title="DASHBOARD" subtitle="Cyber Attack Statistics" />
                <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                        type="number"
                        label="Amount"
                        size="small"
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                        onKeyDown={handleKey}
                        sx={{ width: 90 }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Unit"
                        value={timeUnit}
                        onChange={(e) => setTimeUnit(e.target.value)}
                        SelectProps={{ native: true }}
                        onKeyDown={handleKey}
                        sx={{ width: 120 }}
                    >
                        {["days", "weeks", "months"].map((u) => (
                            <option key={u} value={u}>
                                {u}
                            </option>
                        ))}
                    </TextField>
                    <Button variant="contained" onClick={fetchStats}>
                        Apply
                    </Button>
                </Box>
            </Box>

            {/* Stat Boxes */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="140px"
                gap="20px"
            >
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

                {/* Charts */}
                <Box gridColumn="span 5" gridRow="span 2" backgroundColor={colors.primary[400]}>
                    <Typography variant="h4" fontWeight="600" sx={{ p: "30px 30px 0 30px" }}>
                        Attack Types
                    </Typography>
                    <Box height="250px" mt="-20px">
                        <BarChart isDashboard onBarClick={handleTopicClick} />
                    </Box>
                </Box>

                <Box gridColumn="span 5" gridRow="span 2" backgroundColor={colors.primary[400]} p="30px">
                    <Typography variant="h4" fontWeight="600" sx={{ mb: "15px" }}>
                        Mentioned Countries
                    </Typography>
                    <Box display="flex" height="200px" justifyContent="space-between">
                        <Box flex="1">
                            <GeographyChart isDashboard onCountryClick={handleTopicClick} />
                        </Box>
                        <Box width="30%" pl={2}>
                            <Typography variant="h4" fontWeight="600" sx={{ mb: "10px" }}>
                                Top 3 Mentioned Countries
                            </Typography>
                            {topTargetCountries.map((ct, idx) => (
                                <Typography key={idx} color={colors.grey[100]} sx={{ mb: "8px" }}>
                                    {idx + 1}. {ct.label} ({ct.value})
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Box gridColumn="span 2" gridRow="span 2" backgroundColor={colors.primary[400]} p="30px">
                    <Typography variant="h4" fontWeight="600" sx={{ mb: "15px" }}>
                        Top 5 Techniques
                    </Typography>
                    <Box>
                        {topAttackTechniques.map((tech, idx) => (
                            <Typography key={idx} color={colors.grey[100]} sx={{ mb: "10px" }}>
                                {idx + 1}. {tech._id} ({tech.count})
                            </Typography>
                        ))}
                    </Box>
                </Box>

                <Box gridColumn="span 6" gridRow="span 2" backgroundColor={colors.primary[400]}>
                    <Box mt="25px" px="30px" display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
                            Monthly Attack Statistics
                        </Typography>
                    </Box>
                    <Box height="250px" m="-20px 0 0">
                        <LineChart isDashboard />
                    </Box>
                </Box>

                <Box gridColumn="span 4" gridRow="span 2" backgroundColor={colors.primary[400]} p="30px">
                    <Typography variant="h4" fontWeight="600">
                        Mentioned Sectors
                    </Typography>
                    <Box height="290px" mt="-20px" pt={3} pb={2}>
                        <PieChart isDashboard onSliceClick={handleTopicClick} />
                    </Box>
                </Box>

                <Box gridColumn="span 2" gridRow="span 2" backgroundColor={colors.primary[400]} p="30px">
                    <Typography variant="h4" fontWeight="600" sx={{ mb: "15px" }}>
                        Top 5 Attackers
                    </Typography>
                    <Box>
                        {topAttackers.map((att, idx) => (
                            <Typography key={idx} color={colors.grey[100]} sx={{ mb: "10px" }}>
                                {idx + 1}. {att._id} ({att.count})
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Box>

            <TopicPopup topic={popupTopic} open={open} onClose={closePopup} />
        </Box>
    );
}
