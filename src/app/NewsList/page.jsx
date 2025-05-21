"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Chip,
    Stack,
    CircularProgress,
    Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Popup from "../../components/Popup";

export default function NewsList() {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNews, setSelectedNews] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState(null);

    // Load currentPage from localStorage on mount
    useEffect(() => {
        const storedPage = localStorage.getItem("currentPage");
        if (storedPage) {
            setCurrentPage(parseInt(storedPage, 10));
        }
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/cyber-attack-news', { 
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch news data');
                }
                
                const result = await response.json();
                if (result.error) {
                    throw new Error(result.error);
                }
                
                setNews(result.data);
                setStatistics(result.statistics);
                setFilteredData(result.data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        const filtered = news.filter(
            (news) =>
                news.victimName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (news.threatActor &&
                    news.threatActor.some((actor) =>
                        actor.toLowerCase().includes(searchQuery.toLowerCase())
                    ))
        );
        setFilteredData(filtered);

        if (searchQuery.trim() !== "") {
            setCurrentPage(1);
            localStorage.setItem("currentPage", "1");
        }
    }, [searchQuery, news]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleOpenPopup = (news) => {
        setSelectedNews(news);
        setOpenPopup(true);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const changePage = (newPage) => {
        setCurrentPage(newPage);
        localStorage.setItem("currentPage", newPage.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box m="20px">
                <Alert severity="error">
                    Error loading news data: {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box m="20px" marginTop={5}>
            <Header 
                title="News List" 
                subtitle={`Total Attacks: ${news.length} | Latest Update: ${new Date().toLocaleDateString()}`} 
            />

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by victim or threat actor"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                    mb: 2,
                    backgroundColor: colors.primary[400],
                    borderRadius: "5px",
                    input: {
                        color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    },
                    "& .MuiInputLabel-root": {
                        color: theme.palette.mode === "dark" ? "#bbb" : "#666",
                    },
                }}
            />

            <Box>
                {currentItems.map((news, index) => (
                    <Card
                        key={index}
                        sx={{
                            mb: 2,
                            backgroundColor: colors.primary[400],
                            color: "#fff",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            "&:hover": {
                                transform: "scale(1.01)",
                            },
                        }}
                        onClick={() => handleOpenPopup(news)}
                    >
                        <CardContent>
                            <Typography variant="h6">
                                {news.victimName}
                            </Typography>
                            <Typography variant="body2">
                                {new Date(news.datetime).toLocaleString()}
                            </Typography>

                            <Typography variant="body2" mt={1}>
                                <strong>Industry:</strong>{" "}
                                {news.industry.join(", ")}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Threat Actor:</strong>{" "}
                                {news.threatActor.join(", ")}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Country:</strong>{" "}
                                {news.country.join(", ")}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                                {news.attackType.map((type, i) => (
                                    <Chip
                                        key={i}
                                        label={type}
                                        sx={{
                                            backgroundColor: colors.greenAccent[400],
                                            color: "#000",
                                        }}
                                    />
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Popup
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                news={selectedNews}
            />

            <Box
                display="flex"
                justifyContent="center"
                mt={2}
                alignItems="center"
            >
                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.primary[500], mr: 1 }}
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    BACK
                </Button>

                {[...Array(totalPages)].map((_, pageIndex) => (
                    <Button
                        key={pageIndex}
                        onClick={() => changePage(pageIndex + 1)}
                        sx={{
                            mx: 0.5,
                            backgroundColor:
                                currentPage === pageIndex + 1
                                    ? colors.greenAccent[400]
                                    : colors.primary[500],
                            color:
                                currentPage === pageIndex + 1 ? "#000" : "#fff",
                            fontWeight:
                                currentPage === pageIndex + 1
                                    ? "bold"
                                    : "normal",
                            "&:hover": {
                                backgroundColor: colors.greenAccent[300],
                                color: "#000",
                            },
                        }}
                    >
                        {pageIndex + 1}
                    </Button>
                ))}

                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.primary[500], ml: 1 }}
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    NEXT
                </Button>
            </Box>
        </Box>
    );
}
