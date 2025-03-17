"use client";

import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NewsPopup = ({ open, onClose, news }) => {
    if (!news) return null; // Prevents rendering empty popups

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "20px",
                    padding: "20px",
                    backdropFilter: "blur(10px)",
                    maxHeight: "90vh", // Covers all data while ensuring it fits within the viewport
                    overflowY: "auto", // Enables scrolling if content overflows
                },
            }}
        >
            <DialogTitle>
                <Typography fontWeight="bold" color="black">
                    {news.id} {/* Dynamic Title */}
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
                <Typography variant="body1" color="black">{news.name}</Typography>
                <Typography variant="body1" mt={2} color="black">{news.email}</Typography>
                <Typography variant="body1" mt={2} color="black">{news.phone}</Typography>
            </DialogContent>
        </Dialog>
    );
};

export default NewsPopup;
