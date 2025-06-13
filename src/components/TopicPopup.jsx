"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, List, ListItem,
  ListItemText, CircularProgress, Box, Typography, Link
} from "@mui/material";

import { useTheme } from "@mui/material";
import { tokens } from "../theme";

export default function TopicPopup({ topic, open, onClose }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !topic) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cyber-news-stat");
        const data = await res.json();
        let lookupKey = topic;
        if (["USA", "United States of America"].includes(topic)) {
          lookupKey = "United States";
        }

        let results = [];
        if (lookupKey === "Others") {
          const top6 = (data.sectors || []).slice(0, 6).map(s => s._id);
          Object.entries(data.sectorNewsMap || {}).forEach(([sector, list]) => {
            if (!top6.includes(sector)) {
              list.forEach(n => results.push({ ...n, sector }));
            }
          });
        } else {
          const mapping = {
            ...data.attackNewsMap,
            ...data.sectorNewsMap,
            ...data.countryNewsMap,
          };
          results = mapping[lookupKey] || [];
        }

        const seen = new Map();
        results.forEach(n => {
          if (!seen.has(n._id)) {
            seen.set(n._id, n);
          } else {
            const existing = seen.get(n._id);
            if (!existing.sector && n.sector) {
              existing.sector = n.sector;
            }
          }
        });

        setItems(Array.from(seen.values()));
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, topic]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ backgroundColor: colors.grey[600] }}>{topic} - Related News</DialogTitle>
      <DialogContent sx={{ backgroundColor: colors.grey[600] }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {!loading && items.length > 0 && (
          <List>
            {items.map((n, i) => (
              <Box key={`${n._id}-${i}`}>
                {n.sector && (
                  <Typography
                    variant="subtitle2"
                    sx={{ mt: i === 0 ? 0 : 2, mb: 1 }}
                  >
                    {n.sector}
                  </Typography>
                )}
                <ListItem divider>
                  <ListItemText
                    primary={
                      n.URL || n.url ? (
                        <Link
                          href={n.URL || n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: "white",
                            textDecoration: "underline",
                            "&:hover": {
                              color: colors.greenAccent[600],
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )
                    }
                    secondary={
                      n.date
                        ? new Date(n.date).toLocaleDateString("en-GB")
                        : ""
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}

        {!loading && items.length === 0 && (
          <Typography p={3} color="textSecondary">
            No related news for “{topic}”
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
