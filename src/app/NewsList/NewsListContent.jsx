"use client";

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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Popup from "../../components/Popup";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useBookmarks } from "@/lib/useBookmarks";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatKeyword } from "@/lib/formatKeywords";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


export default function NewsListcontent() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const { bookmarks, mutate } = useBookmarks();

  const fixedTopics = [
    "Phishing", "Malware", "Data", "Credential", "Spyware",
    "Cloud", "Malicious", "Backdoor", "Vulnerability",
    "Mobile", "Website"
  ];
  const [predefinedTopics, setPredefinedTopics] = useState([...fixedTopics]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch("/api/top-ontology-classes");
        const topics = await response.json();
        if (!Array.isArray(topics)) return;
        const fetched = topics.map((item) => typeof item === "string" ? item : item.label || item.uri);
        const unique = Array.from(new Set([...fixedTopics, ...fetched]));
        setPredefinedTopics(unique);
      } catch (err) {
        console.error("Failed to fetch topics", err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/search-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queryTerms: selectedTopics }),
        });
        const text = await response.text();
        if (!text) throw new Error("Empty response body");
        const newsData = JSON.parse(text);
        setNews(newsData.results);
        setFilteredData(newsData.results);
      } catch (err) {
        setError("Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [selectedTopics]);

  useEffect(() => {
    const filtered = news.filter((news) => {
      const matchesText =
        (news["News Title"] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (news.Article || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (news.Labels || []).some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (news.victimName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (news.threatActor || []).some((actor) => actor.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSemantic =
        selectedTopics.length === 0 ||
        selectedTopics.every((topic) =>
          (news.Labels || []).some((label) =>
            label.toLowerCase().includes(topic.toLowerCase())
          )
        );

      return matchesText && matchesSemantic;
    });
    setFilteredData(filtered);
  }, [searchQuery, selectedTopics, news]);

  const toggleBookmark = async (newsItem) => {
    const user = auth.currentUser;
    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

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

  const toggleTopic = (topic) => {
    const updated = selectedTopics.includes(topic)
      ? selectedTopics.filter((t) => t !== topic)
      : [...selectedTopics, topic];
    setSelectedTopics(updated);
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

//   const handleSignOut = async () => {
//     await auth.signOut();
//     document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     localStorage.clear();
//     sessionStorage.clear();
//     window.location.reload();
//   };

  return (
    <Box m="20px" marginTop={5}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Header title="News List" subtitle={`Total Articles: ${filteredData.length}`} />
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

      </Box>
      <Box display="flex" gap={1} mb={2} flexDirection={{ xs: "column", sm: "row" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by query terms"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
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

      <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
        {predefinedTopics.map((topic, i) => (
          <Chip
            key={i}
            label={topic}
            onClick={() => toggleTopic(topic)}
            sx={{
              backgroundColor: selectedTopics.includes(topic) ? colors.greenAccent[400] : colors.grey[500],
              color: selectedTopics.includes(topic) ? "#000" : "#eee",
              fontWeight: "bold",
            }}
            clickable
          />
        ))}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error: {error}</Alert>
      ) : (
        <Box>
          {currentItems.map((newsItem, index) => {
            const keywordEntries = Object.entries(newsItem.Keywords || newsItem.keywords || {})
              .flatMap(([category, items]) => (items || []).map((item) => ({ category, item })));

            const isBookmarked = Array.isArray(bookmarks) && bookmarks.some(
              (b) => b["News Title"] === newsItem["News Title"]
            );

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
                    <IconButton onClick={(e) => { e.stopPropagation(); toggleBookmark(newsItem); }}>
                      {isBookmarked ? (
                        <BookmarkIcon sx={{ color: "gold" }} />
                      ) : (
                        <BookmarkBorderIcon sx={{ color: "white" }} />
                      )}
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: 2 }}>
                    {keywordEntries.slice(0, 5).map((kw, i) => (
                      <Tooltip key={i} title={kw.category}>
                        <Chip
                          label={formatKeyword(kw.category, kw.item)}
                          sx={{ backgroundColor: colors.greenAccent[400], color: "#000", fontSize: "0.9rem" }}
                          onClick={(e) => { e.stopPropagation(); setSearchQuery(kw.item); }}
                          clickable
                        />
                      </Tooltip>
                    ))}
                    {keywordEntries.length > 5 && (
                      <Chip
                        label={`+${keywordEntries.length - 5} more`}
                        sx={{ backgroundColor: colors.grey[500], color: "#000", fontSize: "0.8rem" }}
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

      <Dialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            padding: 3,
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle variant="h4" sx={{ fontWeight: "bold" }}>Login Required</DialogTitle>
        <DialogContent>
          &nbsp; You must be signed in to bookmark news articles.
        </DialogContent>
        <DialogActions>
          <Button
            component={Link}
            href={`/SignIn?redirect=${encodeURIComponent(pathname + (searchParams?.toString() ? '?' + searchParams.toString() : ''))}`}
            variant="contained"
            sx={{ backgroundColor: colors.greenAccent[400], color: "#000" }}
          >
            Sign In
          </Button>
          <Button onClick={() => setLoginDialogOpen(false)}
            sx={{ color: "#fff" }}
          >
              Cancel</Button>
        </DialogActions>
      </Dialog>

      <Box display="flex" justifyContent="center" mt={2} alignItems="center" flexWrap="wrap" gap={1}>
        <Button
          variant="contained"
          sx={{ backgroundColor: colors.primary[500] }}
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
              backgroundColor: currentPage === pageIndex + 1 ? colors.greenAccent[400] : colors.primary[500],
              color: currentPage === pageIndex + 1 ? "#000" : "#fff",
              fontWeight: currentPage === pageIndex + 1 ? "bold" : "normal",
              "&:hover": { backgroundColor: colors.greenAccent[300], color: "#000" },
            }}
          >
            {pageIndex + 1}
          </Button>
        ))}

        <Button
          variant="contained"
          sx={{ backgroundColor: colors.primary[500] }}
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          NEXT
        </Button>
      </Box>
    </Box>
  );
}
