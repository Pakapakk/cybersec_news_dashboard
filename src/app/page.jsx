"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  IconButton
} from "@mui/material";
import { tokens } from "@/theme";
import Header from "@/components/Header";
import LineChart from "@/components/LineChart";
import GeographyChart from "@/components/GeographyChart";
import BarChart from "@/components/BarChart";
import StatBox from "@/components/StatBox";
import PieChart from "@/components/PieChart";
import TopicPopup from "@/components/TopicPopup";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const pathname = usePathname();
const searchParams = useSearchParams();


  const [user] = useAuthState(auth);

  const [newsCount, setNewsCount] = useState(0);
  const [attackMap, setAttackMap] = useState({});
  const [sectorMap, setSectorMap] = useState({});
  const [countryMap, setCountryMap] = useState({});
  const [monthlyCounts, setMonthlyCounts] = useState([]);
  const [topAttackTechniques, setTopAttackTechniques] = useState([]);
  const [topAttackers, setTopAttackers] = useState([]);
  const [topTargetCountries, setTopTargetCountries] = useState([]);
  const [mostUsedAttackType, setMostUsedAttackType] = useState({ label: "N/A", count: 0 });
  const [mostTargetedSector, setMostTargetedSector] = useState({ label: "N/A", count: 0 });

  const [startDate, setStartDate] = useState(dayjs().subtract(11, "month").startOf("month"));
  const [endDate, setEndDate] = useState(dayjs());

  const fetchStats = async (start, end) => {
    const query = `?start=${start.format("MM-YYYY")}&end=${end.format("MM-YYYY")}`;
    const res = await fetch(`/api/cyber-news-stat${query}`);
    if (!res.ok) return;
    const data = await res.json();

    setNewsCount(data.newsCount);
    setAttackMap(data.attackNewsMap || {});
    setSectorMap(data.sectorNewsMap || {});
    setCountryMap(data.countryNewsMap || {});
    setMonthlyCounts(data.monthlyCounts || []);

    const attacks = Object.entries(data.attackNewsMap || {}).map(([id, info]) => ({ _id: id, count: info.count, articles: info.articles }));
    const sectors = Object.entries(data.sectorNewsMap || {}).map(([id, info]) => ({ _id: id, count: info.count, articles: info.articles }));
    const countries = Object.entries(data.countryNewsMap || {}).map(([id, info]) => ({ _id: id, count: info.count, articles: info.articles }));

    setTopAttackTechniques(attacks.sort((a, b) => b.count - a.count).slice(0, 5));
    setTopAttackers(data.top5Attackers || []);

    if (data.mostUsedAttackType?.length) {
      setMostUsedAttackType({ label: data.mostUsedAttackType[0]._id, count: data.mostUsedAttackType[0].count });
    }
    if (data.mostTargetedSector?.length) {
      setMostTargetedSector({ label: data.mostTargetedSector[0]._id, count: data.mostTargetedSector[0].count });
    }

    setTopTargetCountries(countries.sort((a, b) => b.count - a.count).slice(0, 3).map((c) => ({ label: c._id, value: c.count })));
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

  const handleSignOut = async () => {
    await auth.signOut();
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Box mb={4} mt={3} mx={2}>
        
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Header title="DASHBOARD" subtitle="Cyber Attack Statistics" />

        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2}>
          {user ? (
            <IconButton
                onClick={() => router.push("/Profile")}
                sx={{
                color: colors.greenAccent[500],
                fontWeight: "bold",
                "&:hover": {
                    backgroundColor: colors.greenAccent[500],
                    color: "#000",
                },
                }}
            >
                <AccountCircleIcon fontSize="large" />
            </IconButton>
            ) : (
            <Button
                variant="outlined"
                component={Link}
                href={`/SignIn?redirect=${encodeURIComponent(pathname + (searchParams?.toString() ? '?' + searchParams.toString() : ''))}`}
                sx={{
                borderColor: colors.greenAccent[500],
                color: colors.greenAccent[500],
                fontWeight: "bold",
                "&:hover": {
                    backgroundColor: colors.greenAccent[500],
                    color: "#000",
                    borderColor: colors.greenAccent[500],
                },
                }}
            >
                Sign In
            </Button>
            )}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" alignItems="center" gap={1}>
              <DatePicker
                label="Start"
                views={["year", "month"]}
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
              />
              <DatePicker
                label="End"
                views={["year", "month"]}
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
              />
              <Button variant="contained" onClick={handleApply}>Apply</Button>
            </Box>
          </LocalizationProvider>
        </Box>
      </Box>

            {/* Stats */}
            <Box
                mt={3}
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
