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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Popup from "../../components/Popup";
import cyberAttackNews from "../../data/json/cyber_attack_news.json"; // Import JSON data

const NewsList = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNews, setSelectedNews] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Show 10 news per page

    useEffect(() => {
        const filtered = cyberAttackNews.filter(
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
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery]);

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

    // Function to change page and scroll to top
    const changePage = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
    };

    return (
        <Box m="20px" marginTop={5}>
            <Header title="News List" subtitle="List of Cybersecurity News" />

            {/* Search Bar */}
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
                }}
                InputLabelProps={{
                    style: {
                        color: theme.palette.mode === "dark" ? "#bbb" : "#666",
                    },
                }}
            />

            {/* Cards for List */}
            <Box>
                {currentItems.map((news, index) => (
                    <Card
                        key={index}
                        sx={{
                            mb: 2,
                            backgroundColor: colors.primary[400],
                            color: "#fff",
                            cursor: "pointer",
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

                            {/* Additional Details */}
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
                            {/* Tags inside the card */}
                            <Stack direction="row" spacing={1} mt={1}>
                                {news.attackType.map((type, i) => (
                                    <Chip
                                        key={i}
                                        label={type}
                                        sx={{
                                            backgroundColor:
                                                colors.greenAccent[400],
                                            color: "#000",
                                        }}
                                    />
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Popup Component */}
            <Popup
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                news={selectedNews}
            />

            {/* Pagination */}
            <Box
                display="flex"
                justifyContent="center"
                mt={2}
                alignItems="center"
            >
                <Button
                    variant="contained"
                    sx={{ backgroundColor: colors.primary[500], mr: 1 }}
                    onClick={() => {
                        changePage(currentPage - 1);
                        setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top after page change
                        }, 100); // Slight delay to ensure page change before scroll
                    }}
                    disabled={currentPage === 1} // Disable if on first page
                >
                    BACK
                </Button>

                {/* Page Number Buttons */}
                {[...Array(totalPages)].map((_, pageIndex) => (
                    <Button
                        key={pageIndex}
                        onClick={() => {
                            changePage(pageIndex + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page click
                        }}
                        sx={{
                            mx: 0.5,
                            backgroundColor:
                                currentPage === pageIndex + 1
                                    ? colors.greenAccent[400]
                                    : colors.primary[500],
                            color:
                                currentPage === pageIndex + 1 ? "#000" : "#fff", // Change color to black when active
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
                    onClick={() => {
                        changePage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on "NEXT"
                    }}
                    disabled={currentPage === totalPages}
                >
                    NEXT
                </Button>
            </Box>
        </Box>
    );
};

export default NewsList;
