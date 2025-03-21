"use client";

import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    IconButton, 
    Typography, 
    Box, 
    Stack, 
    Chip 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NewsPopup = ({ open, onClose, news }) => {
    if (!news) return null; // Prevent rendering empty popups

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
                <Typography fontWeight="bold" color="black">
                    Cyber Attack Report - {news.victimName}
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
                {/* Date */}
                <Typography variant="body2" color="gray" mb={2}>
                    Reported on: {new Date(news.datetime).toLocaleString()}
                </Typography>

                {/* Attack Types */}
                <Typography variant="body1" fontWeight="bold" color="black">
                    Attack Types:
                </Typography>
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                    {news.attackType.map((type, i) => (
                        <Chip key={i} label={type} sx={{ backgroundColor: "#d32f2f", color: "#fff" }} />
                    ))}
                </Stack>

                {/* Industry */}
                <Typography variant="body1" fontWeight="bold" color="black">
                    Targeted Industries:
                </Typography>
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                    {news.industry.map((industry, i) => (
                        <Chip key={i} label={industry} sx={{ backgroundColor: "#1976d2", color: "#fff" }} />
                    ))}
                </Stack>

                {/* Threat Actors */}
                <Typography variant="body1" fontWeight="bold" color="black">
                    Threat Actors:
                </Typography>
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                    {news.threatActor.map((actor, i) => (
                        <Chip key={i} label={actor} sx={{ backgroundColor: "#388e3c", color: "#fff" }} />
                    ))}
                </Stack>

                {/* Country */}
                <Typography variant="body1" fontWeight="bold" color="black">
                    Affected Countries:
                </Typography>
                <Stack direction="row" spacing={1} mt={1} mb={2}>
                    {news.country.map((country, i) => (
                        <Chip key={i} label={country} sx={{ backgroundColor: "#ffa000", color: "#fff" }} />
                    ))}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default NewsPopup;
