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
    CircularProgress,
    Alert,
    Tooltip,
    Stack,
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [semanticTags, setSemanticTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showAllTags, setShowAllTags] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/search-news", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ queryTerms: [] }),
                });

                const result = await response.json();
                setNews(result.results);
                setFilteredData(result.results);

                const tagFrequency = {};
                result.results.forEach((item) => {
                    (item.Labels || []).forEach((label) => {
                        tagFrequency[label] = (tagFrequency[label] || 0) + 1;
                    });
                });

                const filteredTags = Object.entries(tagFrequency)
                    .filter(([_, count]) => count > 15)
                    .map(([label]) => label)
                    .sort();

                setSemanticTags(filteredTags);
            } catch (err) {
                setError("Failed to fetch news");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        const filtered = news.filter((news) => {
            const matchesText =
                (news["News Title"] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (news.Article || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (news.Labels || []).some(label => label.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (news.victimName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (news.threatActor || []).some(actor => actor.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => (news.Labels || []).includes(tag));

            return matchesText && matchesTags;
        });

        setFilteredData(filtered);
    }, [searchQuery, selectedTags, news]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleOpenPopup = (newsItem) => {
        setSelectedNews(newsItem);
        setOpenPopup(true);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const changePage = (newPage) => {
        setCurrentPage(newPage);
        localStorage.setItem("currentPage", newPage.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <Box m="20px" marginTop={5}>
            <Header title="News List" subtitle={`Total Articles: ${filteredData.length}`} />

            <Box display="flex" gap={1} mb={1}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by query terms"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    sx={{
                        backgroundColor: colors.primary[400],
                        borderRadius: "5px",
                        input: { color: theme.palette.mode === "dark" ? "#fff" : "#000" },
                    }}
                />
                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.greenAccent[500], color: "#000" }}
                    onClick={() => setSearchQuery(searchQuery.trim())}
                >
                    SEARCH
                </Button>
            </Box>

            {semanticTags.length > 0 && (
                <Box mb={1}>
                    <Box
                        sx={{
                            maxHeight: showAllTags ? "none" : "70px",
                            overflow: "hidden",
                            position: "relative",
                            transition: "max-height 0.3s ease",
                            mb: 1,
                        }}
                    >
                        <Box display="flex" flexWrap="wrap" gap="8px">
                            {semanticTags.map((tag, i) => (
                                <Chip
                                    key={i}
                                    label={tag}
                                    onClick={() => toggleTag(tag)}
                                    sx={{
                                        backgroundColor: selectedTags.includes(tag)
                                            ? colors.greenAccent[400]
                                            : colors.grey[600],
                                        color: "#eee",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        fontSize: "0.85rem",
                                    }}
                                    clickable
                                />
                            ))}
                        </Box>
                        {!showAllTags && semanticTags.length > 30 && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "30px",
                                    background: `linear-gradient(to top, ${colors.primary[400]}, transparent)`
                                }}
                            />
                        )}
                    </Box>

                    {semanticTags.length > 30 && (
                        <Button
                            size="small"
                            onClick={() => setShowAllTags(!showAllTags)}
                            sx={{ mb: 2, color: colors.greenAccent[400] }}
                        >
                            {showAllTags ? "Show Less" : "Show More"}
                        </Button>
                    )}
                </Box>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">Error: {error}</Alert>
            ) : (
                <Box>
                    {currentItems.map((newsItem, index) => {
                        const labelScores = (newsItem.Labels || []).map(label => {
                            const entry = Object.entries(newsItem["Classes and Scores"] || {}).find(
                                ([uri]) => uri.toLowerCase().includes(label.toLowerCase().replace(/\s/g, ""))
                            );
                            return {
                                label,
                                score: entry ? parseFloat(entry[1]) : 0,
                            };
                        }).sort((a, b) => b.score - a.score);

                        return (
                            <Card
                                key={index}
                                sx={{
                                    mb: 2,
                                    backgroundColor: colors.primary[400],
                                    color: "#fff",
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                    "&:hover": { transform: "scale(1.01)" },
                                }}
                                onClick={() => handleOpenPopup(newsItem)}
                            >
                                <CardContent>
                                    <Typography variant="h4" fontWeight="bold" mb={1}>
                                        {newsItem["News Title"]}
                                    </Typography>

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: 2 }}>
                                        {labelScores.slice(0, 5).map((item, i) => (
                                            <Tooltip key={i} title={`Score: ${item.score.toFixed(3)}`}>
                                                <Chip
                                                    label={item.label}
                                                    sx={{
                                                        backgroundColor: colors.greenAccent[400],
                                                        color: "#000",
                                                        fontSize: "0.9rem",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSearchQuery(item.label);
                                                    }}
                                                    clickable
                                                />
                                            </Tooltip>
                                        ))}
                                        {labelScores.length > 5 && (
                                            <Chip
                                                label={`+${labelScores.length - 5} more`}
                                                sx={{
                                                    backgroundColor: colors.grey[500],
                                                    color: "#000",
                                                    fontSize: "0.8rem",
                                                }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}

            <Popup
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                news={selectedNews}
            />

            <Box display="flex" justifyContent="center" mt={2} alignItems="center">
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
                            color: currentPage === pageIndex + 1 ? "#000" : "#fff",
                            fontWeight: currentPage === pageIndex + 1 ? "bold" : "normal",
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
