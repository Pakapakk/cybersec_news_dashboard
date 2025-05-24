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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme"; // adjust path if needed

const NewsPopup = ({ open, onClose, news }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!news) return null;

  const labelScores = (news.Labels || []).map((label) => {
    const entry = Object.entries(news["Classes and Scores"] || {}).find(
      ([uri]) =>
        uri.toLowerCase().includes(label.toLowerCase().replace(/\s/g, ""))
    );
    return {
      label,
      score: entry ? parseFloat(entry[1]) : 0,
    };
  }).sort((a, b) => b.score - a.score);

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return rawDate; // fallback if parsing fails
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "12px",
          padding: "20px",
          maxHeight: "90vh",
          overflowY: "auto",
        },
      }}
    >
      <DialogTitle>
        <Typography component="span" variant="h3" fontWeight="bold" color="black">
          Cyber Attack Report - {news.victimName || news["News Title"] || "Unknown"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 15, top: 15 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Article */}
        <Typography variant="body1" fontWeight="bold" color="black" mt={1} mb={1}>
          Article:
        </Typography>
        <Typography
          variant="body2"
          color="gray"
          sx={{ whiteSpace: "pre-line", mb: 2 }}
        >
          {news.Article || "No article content available."}
        </Typography>

        {/* Publish Date */}
        {news["Publish Date"] && (
          <>
            <Typography variant="body1" fontWeight="bold" color="black" mt={2} mb={1}>
              Publish Date:
            </Typography>
            <Typography variant="body2" color="gray" mb={2}>
              {formatDate(news["Publish Date"])}
            </Typography>
          </>
        )}

        {/* URL */}
        {news.URL && (
          <>
            <Typography variant="body1" fontWeight="bold" color="black" mt={2} mb={1}>
              Source:
            </Typography>
            <Typography variant="body2" color="gray" mb={2}>
              <Link
                href={news.URL}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                {news.URL}
              </Link>
            </Typography>
          </>
        )}

        {/* Tags */}
        {labelScores.length > 0 && (
          <>
            <Typography variant="body1" fontWeight="bold" color="black" mt={2}>
              Tags:
            </Typography>
            <Box mt={1} sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {labelScores.map((item, i) => (
                <Tooltip key={i} title={`Score: ${item.score.toFixed(3)}`}>
                  <Chip
                    label={item.label}
                    sx={{
                      backgroundColor: colors.greenAccent[400],
                      color: "#000",
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewsPopup;
