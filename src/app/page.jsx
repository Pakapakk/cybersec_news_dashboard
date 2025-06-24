"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, useTheme } from "@mui/material";
import { tokens } from "@/theme";
import Header from "@/components/Header";
import LineChart from "@/components/LineChart";
import GeographyChart from "@/components/GeographyChart";
import BarChart from "@/components/BarChart";
import StatBox from "@/components/StatBox";
import PieChart from "@/components/PieChart";
import TopicPopup from "@/components/TopicPopup";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [newsCount, setNewsCount] = useState(0);
    const [attackMap, setAttackMap] = useState({});
    const [sectorMap, setSectorMap] = useState({});
    const [countryMap, setCountryMap] = useState({});
    const [monthlyCounts, setMonthlyCounts] = useState([]);
    const [attackCounts, setAttackCounts] = useState([]);
    const [sectorCounts, setSectorCounts] = useState([]);
    const [countryCounts, setCountryCounts] = useState([]);
    const [topAttackTechniques, setTopAttackTechniques] = useState([]);
    const [topAttackers, setTopAttackers] = useState([]);
    const [topTargetCountries, setTopTargetCountries] = useState([]);
    const [mostUsedAttackType, setMostUsedAttackType] = useState({
        label: "N/A",
        count: 0,
    });
    const [mostTargetedSector, setMostTargetedSector] = useState({
        label: "N/A",
        count: 0,
    });

    const [startDate, setStartDate] = useState(
        dayjs().subtract(11, "month").startOf("month")
    );
    const [endDate, setEndDate] = useState(dayjs());

    const fetchStats = async (start, end) => {
        const query = `?start=${start.format("MM-YYYY")}&end=${end.format(
            "MM-YYYY"
        )}`;
        const res = await fetch(`/api/cyber-news-stat${query}`);
        if (!res.ok) return;
        const data = await res.json();

        setNewsCount(data.newsCount);
        setAttackMap(data.attackNewsMap || {});
        setSectorMap(data.sectorNewsMap || {});
        setCountryMap(data.countryNewsMap || {});
        setMonthlyCounts(data.monthlyCounts || []);

        // Convert maps into arrays with shape {_id, count, articles}
        const attacks = Object.entries(data.attackNewsMap || {}).map(
            ([id, info]) => ({
                _id: id,
                count: info.count,
                articles: info.articles,
            })
        );
        const sectors = Object.entries(data.sectorNewsMap || {}).map(
            ([id, info]) => ({
                _id: id,
                count: info.count,
                articles: info.articles,
            })
        );
        const countries = Object.entries(data.countryNewsMap || {}).map(
            ([id, info]) => ({
                _id: id,
                count: info.count,
                articles: info.articles,
            })
        );

        setAttackCounts(attacks);
        setSectorCounts(sectors);
        setCountryCounts(countries);

        setTopAttackTechniques(
            attacks.sort((a, b) => b.count - a.count).slice(0, 5)
        );
        setTopAttackers(data.top5Attackers || []);

        if (data.mostUsedAttackType?.length) {
            setMostUsedAttackType({
                label: data.mostUsedAttackType[0]._id,
                count: data.mostUsedAttackType[0].count,
            });
        }
        if (data.mostTargetedSector?.length) {
            setMostTargetedSector({
                label: data.mostTargetedSector[0]._id,
                count: data.mostTargetedSector[0].count,
            });
        }

        const top3Countries = countries
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((c) => ({ label: c._id, value: c.count }));
        setTopTargetCountries(top3Countries);
    };

    useEffect(() => {
        fetchStats(startDate, endDate);
    }, []);

    const handleApply = () => fetchStats(startDate, endDate);

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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <DatePicker
                            label="Start"
                            views={["year", "month"]}
                            inputFormat="MMMM YYYY"
                            value={startDate}
                            onChange={setStartDate}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    sx={{ width: 150 }}
                                />
                            )}
                        />
                        <DatePicker
                            label="End"
                            views={["year", "month"]}
                            inputFormat="MMMM YYYY"
                            value={endDate}
                            onChange={setEndDate}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    sx={{ width: 150 }}
                                />
                            )}
                        />
                        <Button variant="contained" onClick={handleApply}>
                            Apply
                        </Button>
                    </Box>
                </LocalizationProvider>
            </Box>

            {/* Stats */}
            <Box
                display="grid"
                gridTemplateColumns="repeat(12,1fr)"
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

                {/* BarChart */}
                <Box
                    gridColumn="span 5"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                >
                    <Typography
                        variant="h4"
                        fontWeight="600"
                        sx={{ p: "30px 30px 0 30px" }}
                    >
                        Attack Types
                    </Typography>
                    <Box height="250px" mt="-20px">
                        <BarChart
                            isDashboard
                            attackNewsMap={attackMap}
                            onBarClick={handleTopicClick}
                        />
                    </Box>
                </Box>

                {/* GeographyChart */}
                <Box
                    gridColumn="span 5"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography
                        variant="h4"
                        fontWeight="600"
                        sx={{ mb: "15px" }}
                    >
                        Mentioned Countries
                    </Typography>
                    <Box height="200px">
                        <GeographyChart
                            isDashboard
                            countryNewsMap={countryMap}
                            onCountryClick={handleTopicClick}
                            topCountries={topTargetCountries}
                        />
                    </Box>
                </Box>


                {/* Top Techniques List */}
                <Box
                    gridColumn="span 2"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography
                        variant="h4"
                        fontWeight="600"
                        sx={{ mb: "15px" }}
                    >
                        Top 5 Techniques
                    </Typography>
                    <Box>
                        {topAttackTechniques.map((t, i) => (
                            <Typography
                                key={i}
                                color={colors.grey[100]}
                                sx={{ mb: "10px" }}
                            >
                                {i + 1}. {t._id} ({t.count})
                            </Typography>
                        ))}
                    </Box>
                </Box>

                {/* LineChart */}
                <Box
                    gridColumn="span 6"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                >
                    <Box
                        mt="25px"
                        px="30px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="h4"
                            fontWeight="600"
                            color={colors.grey[100]}
                        >
                            Monthly Attack Statistics
                        </Typography>
                    </Box>
                    <Box height="250px" m="-20px 0 0">
                        <LineChart isDashboard monthlyCounts={monthlyCounts} />
                    </Box>
                </Box>

                {/* PieChart */}
                <Box
                    gridColumn="span 4"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography variant="h4" fontWeight="600">
                        Mentioned Sectors
                    </Typography>
                    <Box height="290px" mt="-20px" pt={3} pb={2}>
                        <PieChart
                            isDashboard
                            sectors={sectorMap}
                            onSliceClick={handleTopicClick}
                        />
                    </Box>
                </Box>

                {/* Top Attackers list */}
                <Box
                    gridColumn="span 2"
                    gridRow="span 2"
                    backgroundColor={colors.primary[400]}
                    p="30px"
                >
                    <Typography
                        variant="h4"
                        fontWeight="600"
                        sx={{ mb: "15px" }}
                    >
                        Top 5 Attackers
                    </Typography>
                    <Box>
                        {topAttackers.map((a, i) => (
                            <Typography
                                key={i}
                                color={colors.grey[100]}
                                sx={{ mb: "10px" }}
                            >
                                {i + 1}. {a._id} ({a.count})
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Box>

            <TopicPopup
                topic={popupTopic}
                open={open}
                onClose={closePopup}
                attackNewsMap={attackMap}
                sectorNewsMap={sectorMap}
                countryNewsMap={countryMap}
            />
        </Box>
    );
}
