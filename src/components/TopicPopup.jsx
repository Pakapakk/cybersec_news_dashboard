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
        const res = await fetch(
          `/api/cybernews-stat-match?term=${encodeURIComponent(topic)}`
        );
        const data = await res.json();
        setItems(data.items || []);
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
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : items.length ? (
          <List>
            {items.map(n => (
              <ListItem key={n._id} divider>
                <ListItemText
                  primary={
                    n.URL ? (
                      <Link href={n.URL} target="_blank" rel="noopener">
                        {n["News Title"]}
                      </Link>
                    ) : n["News Title"]
                  }
                  secondary={n["Publish Date"] ? new Date(n["Publish Date"]).toLocaleDateString() : ""}
                />
              </ListItem>
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
