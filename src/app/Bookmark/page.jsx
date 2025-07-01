"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Box,
  Link,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Popup from "../../components/Popup";
import { useBookmarks } from "@/lib/useBookmarks";
import { useState, useMemo } from "react";
import { auth } from "@/lib/firebase";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const BookmarkList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedNews, setSelectedNews] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;
  const { bookmarks, mutate, isLoading, error } = useBookmarks();

  const toggleBookmark = async (newsItem) => {
  const user = auth.currentUser;
  if (!user) return;

  const isBookmarked = Array.isArray(bookmarks) &&
    bookmarks.some((b) => b["News Title"] === newsItem["News Title"]);

  const method = isBookmarked ? "DELETE" : "POST";

  const body = isBookmarked
    ? {
        title: newsItem["News Title"],
        userId: user.uid,
      }
    : {
        ...newsItem,
        userId: user.uid,
        _id: newsItem._id,
      };

  const res = await fetch("/api/cyber-news-bookmark", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) mutate();
};

  const handleOpenPopup = (newsItem) => {
    setSelectedNews(newsItem);
    setOpenPopup(true);
  };

  const filteredBookmarks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return Array.isArray(bookmarks)
      ? bookmarks.filter((item) => {
          return (
            item["News Title"]?.toLowerCase().includes(query) ||
            item.Article?.toLowerCase().includes(query) ||
            (item.Labels || []).some((l) => l.toLowerCase().includes(query))
          );
        })
      : [];
  }, [bookmarks, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookmarks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookmarks.length / itemsPerPage);

  const changePage = (newPage) => {
    setCurrentPage(newPage);
    localStorage.setItem("bookmarkPage", newPage.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    await auth.signOut();
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Box m="20px" marginTop={5}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Header title="Bookmarked News" subtitle={`Total Bookmarks: ${filteredBookmarks.length}`} />
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
      </Box>


      <Box display="flex" gap={1} mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search in bookmarks"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            backgroundColor: colors.primary[400],
            borderRadius: "5px",
            input: {
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            },
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

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error: {error.message}</Alert>
      ) : (
        <Box>
          {currentItems.map((newsItem, index) => {
            const keywordEntries = Object.entries(newsItem.Keywords || newsItem.keywords || {})
              .flatMap(([category, items]) => (items || []).map((item) => ({ category, item })));

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
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight="bold" mb={1}>
                      {newsItem["News Title"]}
                    </Typography>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(newsItem);
                      }}
                    >
                      <BookmarkIcon sx={{ color: "gold" }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: 2 }}>
                    {keywordEntries.slice(0, 5).map((kw, i) => (
                      <Tooltip key={i} title={kw.category}>
                        <Chip
                          label={kw.item}
                          sx={{
                            backgroundColor: colors.greenAccent[400],
                            color: "#000",
                            fontSize: "0.9rem",
                          }}
                          onClick={(e) => e.stopPropagation()}
                          clickable
                        />
                      </Tooltip>
                    ))}
                    {keywordEntries.length > 5 && (
                      <Chip
                        label={`+${keywordEntries.length - 5} more`}
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

      <Popup open={openPopup} onClose={() => setOpenPopup(false)} news={selectedNews} />

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
              backgroundColor: currentPage === pageIndex + 1 ? colors.greenAccent[400] : colors.primary[500],
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
};

export default BookmarkList;
