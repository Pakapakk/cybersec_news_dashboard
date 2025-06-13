"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemText,
  CircularProgress, Box, Typography, Link
} from "@mui/material";

export default function TopicPopup({ topic, open, onClose }) {
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
        // Convert from ISO3 map clicks
        if (topic === "USA" || topic === "United States of America") {
          lookupKey = "United States";
        }

        let results = [];
        if (lookupKey === "Others") {
          const top7 = (data.sectors || []).slice(0, 7).map(s => s._id);
          Object.entries(data.sectorNewsMap || {}).forEach(([sector, list]) => {
            if (!top7.includes(sector)) {
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

        // Deduplicate while preserving sector tag
        const seen = new Map();
        results.forEach(n => {
          if (!seen.has(n._id)) {
            seen.set(n._id, n);
          } else if (!seen.get(n._id).sector && n.sector) {
            seen.get(n._id).sector = n.sector;
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
      <DialogTitle>{topic} – Related News</DialogTitle>
      <DialogContent>
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
                  <Typography variant="subtitle2" sx={{ mt: i === 0 ? 0 : 2, mb: 1 }}>
                    {n.sector}
                  </Typography>
                )}
                <ListItem divider>
                  <ListItemText
                    primary={
                      n.URL ? (
                        <Link href={n.URL} target="_blank" rel="noopener">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )
                    }
                    secondary={
                      n.date
                        ? new Date(n.date).toLocaleDateString()
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
