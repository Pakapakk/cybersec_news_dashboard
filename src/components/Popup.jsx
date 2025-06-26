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
import { tokens } from "../theme";
import { formatKeyword } from "@/lib/formatKeywords";

const NewsPopup = ({ open, onClose, news }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!news) return null;

  const keywords = Object.entries(news.Keywords || news.keywords || {})
    .flatMap(([category, items]) =>
      (items || []).map((item) => ({ category, item }))
    )
    .filter((entry) => entry.item);

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return rawDate;
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
          {news.victimName || news["News Title"] || "Unknown"}
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
        {/* Keywords */}
        {keywords.length > 0 && (
          <>
            <Typography variant="h4" fontWeight="bold" color="black" mt={1}>
              Keywords:
            </Typography>
            <Box pl={2}>
              {Object.entries(news.Keywords || news.keywords || {}).map(
                ([category, items], idx) => {
                  if (!items || items.length === 0) return null;

                  const categoryLabel =
                    category.charAt(0).toUpperCase() + category.slice(1);

                  return (
                    <Box key={idx} mt={1} mb={2}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="black"
                        gutterBottom
                      >
                        {categoryLabel}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {items.map((item, i) => (
                          <Chip
                            key={i}
                            label={formatKeyword(category, item)}
                            sx={{
                              backgroundColor: colors.greenAccent[400],
                              color: "#000",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                }
              )}
            </Box>
          </>
        )}

        {/* Article */}
        <Typography variant="h4" fontWeight="bold" color="black" mt={2} mb={1}>
          Article:
        </Typography>
        <Box
          sx={{
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "12px",
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            color="gray"
            sx={{ whiteSpace: "pre-line" }}
          >
            {news.Article || "No article content available."}
          </Typography>
        </Box>

        {/* Publish Date */}
        {news["Publish Date"] && (
          <>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="black"
              mt={2}
              mb={1}
            >
              Publish Date:
            </Typography>
            <Box pl={2}>
              <Typography variant="body2" color="gray" mb={2}>
                {formatDate(news["Publish Date"])}
              </Typography>
            </Box>
          </>
        )}

        {/* URL */}
        {news.URL && (
          <>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="black"
              mt={2}
              mb={1}
            >
              Source:
            </Typography>
            <Box pl={2}>
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
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewsPopup;