"use client";
import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemText, CircularProgress, Box, Typography, Link
} from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

export default function TopicPopup({
  topic,
  open,
  onClose,
  attackNewsMap = {},
  sectorNewsMap = {},
  countryNewsMap = {},
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only run when open becomes true
    if (!open || !topic) return;

    setLoading(true);

    const lookupKey = ["USA", "United States of America"].includes(topic)
      ? "United States"
      : topic;

    let aggregated = [];
    if (lookupKey === "Others") {
      const sorted = Object.entries(sectorNewsMap)
        .sort(([, a], [, b]) => b.count - a.count);
      const top6 = sorted.slice(0, 6).map(([k]) => k);
      sorted.slice(6).forEach(([sector, info]) =>
        (info.articles || []).forEach(a => aggregated.push({ ...a, sector }))
      );
    } else {
      const unified = {
        ...attackNewsMap,
        ...sectorNewsMap,
        ...countryNewsMap,
      };
      const candidate = unified[lookupKey] || {};
      aggregated = Array.isArray(candidate.articles)
        ? candidate.articles.map(a => ({ ...a, sector: candidate._sector }))
        : [];
    }

    // Deduplicate by _id
    const unique = Array.from(
      aggregated.reduce((map, a) => {
        if (!map.has(a._id)) map.set(a._id, a);
        return map;
      }, new Map()).values()
    );

    setItems(unique);
    setLoading(false);
  }, [
    open,
    topic,
    // stable references only
    JSON.stringify(attackNewsMap),
    JSON.stringify(sectorNewsMap),
    JSON.stringify(countryNewsMap),
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ backgroundColor: colors.grey[600] }}>
        {topic} – Related News
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.grey[600] }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : items.length ? (
          <List>
            {items.map((n, i) => (
              <Box key={`${n._id}-${i}`}>
                {n.sector && i === 0 && (
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sector: {n.sector}
                  </Typography>
                )}
                <ListItem divider>
                  <ListItemText
                    primary={
                      <Link
                        href={n.URL || n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "white",
                          textDecoration: "underline",
                          "&:hover": { color: colors.greenAccent[600] },
                        }}
                      >
                        {n.title}
                      </Link>
                    }
                    secondary={n.date ? new Date(n.date).toLocaleDateString("en-GB") : ""}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        ) : (
          <Typography p={3} color="textSecondary">
            No related news for “{topic}”
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
