"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData"; // Adjust this to your actual data source
import Header from "../../components/Header";
import Popup from "../../components/Popup"; // Import the popup component

const NewsList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState(null); // Store selected news data
  const [openPopup, setOpenPopup] = useState(false); // Manage popup open state

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to open the popup with news details
  const handleOpenPopup = (news) => {
    setSelectedNews(news);
    setOpenPopup(true);
  };

  // Placeholder function for filtering
  const filteredData = mockDataContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box m="20px" marginTop={5}>
      <Header title="News List" subtitle="List of Cybersecurity News" />

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Attacker or victim name"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          mb: 2,
          backgroundColor: colors.primary[400],
          borderRadius: "5px",
          input: {
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
          },
        }}
        InputLabelProps={{
          style: { color: theme.palette.mode === "dark" ? "#bbb" : "#666" },
        }}
      />

      {/* Cards for List */}
      <Box>
        {filteredData.map((contact) => (
          <Card
            key={contact.id}
            sx={{
              mb: 2,
              backgroundColor: colors.primary[400],
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => handleOpenPopup(contact)} // Open popup on click
          >
            <CardContent>
              <Typography variant="h6">
                {contact.name} ・ {contact.city}
              </Typography>
              <Typography variant="body2">{contact.email}</Typography>
              <Typography variant="body2">{contact.phone}</Typography>
              <Typography variant="body2">{contact.address}</Typography>

              {/* Tags inside the card */}
              <Stack direction="row" spacing={1} mt={1}>
                <Chip label="hashtag" sx={{ backgroundColor: colors.grey[700], color: "#fff" }} />
                <Chip label="hashtag" sx={{ backgroundColor: colors.grey[700], color: "#fff" }} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Popup Component */}
      <Popup 
        open={openPopup} 
        onClose={() => setOpenPopup(false)} 
        news={selectedNews} // Pass selected news data
      />

      {/* Pagination Buttons */}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button variant="contained" sx={{ backgroundColor: colors.primary[500] }}>
          BACK
        </Button>
        <Button variant="contained" sx={{ backgroundColor: colors.primary[500] }}>
          NEXT
        </Button>
      </Box>
    </Box>
  );
};

export default NewsList;
