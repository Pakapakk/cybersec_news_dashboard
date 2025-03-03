"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData"; // Adjust this to your actual data source
import Header from "../../components/Header";

const NewsList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("ALL");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleLanguageChange = (event, newLanguage) => {
    if (newLanguage !== null) setLanguage(newLanguage);
  };

  // Placeholder function for filtering
  const filteredData = mockDataContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box m="20px" marginTop={5}>
      <Header title="News List" subtitle="List of Cybersecurity News" />

      {/* Language Toggle */}
      {/* <ToggleButtonGroup
        value={language}
        exclusive
        onChange={handleLanguageChange}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="THA" sx={{ backgroundColor: colors.primary[500], color: "#fff" }}>
          THA
        </ToggleButton>
        <ToggleButton value="ALL" sx={{ backgroundColor: colors.grey[500], color: "#fff" }}>
          ALL
        </ToggleButton>
        <ToggleButton value="ENG" sx={{ backgroundColor: colors.primary[500], color: "#fff" }}>
          ENG
        </ToggleButton>
      </ToggleButtonGroup> */}

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
      color: theme.palette.mode === "dark" ? "#fff" : "#000", // White in dark mode, black in light mode
    },
  }}
  InputLabelProps={{
    style: { color: theme.palette.mode === "dark" ? "#bbb" : "#666" }, // Label color
  }}
/>


      {/* Tags Section */}
      <Box
        sx={{
          border: `1px solid ${colors.primary[500]}`,
          borderRadius: "10px",
          p: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tags
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {["Test", "Start", "Lockbit3.0", "Dark Web", "Ransomware"].map((tag) => (
            <Chip key={tag} label={tag} sx={{ backgroundColor: colors.blueAccent[500], color: "#fff" }} />
          ))}
        </Stack>
      </Box>

      {/* Cards for List */}
      <Box>
        {filteredData.map((contact) => (
          <Card key={contact.id} sx={{ mb: 2, backgroundColor: colors.primary[400], color: "#fff" }}>
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






// popup
// "use client";

// import { useState } from "react";
// import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import Button from "@mui/material/Button";

// const NewsPopup = ({ open, onClose }) => {
//     return (
//         <Dialog
//             open={open}
//             onClose={onClose}
//             maxWidth="md"
//             fullWidth
//             sx={{
//                 "& .MuiDialog-paper": {
//                     backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent
//                     borderRadius: "20px", // Rounded edges
//                     padding: "20px",
//                     backdropFilter: "blur(10px)", // Blurred background
//                 },
//             }}
//         >
//             <DialogTitle>
//                 <Typography variant="h5" fontWeight="bold">Short Topic of News</Typography>
//                 <IconButton 
//                     aria-label="close" 
//                     onClick={onClose} 
//                     sx={{ position: "absolute", right: 15, top: 15 }}
//                 >
//                     <CloseIcon />
//                 </IconButton>
//             </DialogTitle>
//             <DialogContent>
//                 <Typography variant="body1">
//                     Lorem ipsum praesent ac massa at ligula reet est iaculis. Vivamus est mist 
//                     aliquet elit ac nisl. Lorem ipsum praesent ac massa at ligula reet est iaculis.
//                 </Typography>
//                 <Typography variant="body1" mt={2}>
//                     Lorem ipsum praesent ac massa at ligula reet est iaculis. Vivamus est mist 
//                     aliquet elit ac nisl.
//                 </Typography>
//             </DialogContent>
//         </Dialog>
//     );
// };

// const NewsPage = () => {
//     const [open, setOpen] = useState(false);

//     return (
//         <Box>
//             {/* Button to trigger the popup */}
//             <Button variant="contained" onClick={() => setOpen(true)}>
//                 Open News
//             </Button>

//             {/* Popup Component */}
//             <NewsPopup open={open} onClose={() => setOpen(false)} />
//         </Box>
//     );
// };

// export default NewsPage;
