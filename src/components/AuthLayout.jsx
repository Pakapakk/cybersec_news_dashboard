"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

export default function AuthLayout({ title, children }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: colors.primary[600] }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 6,                // increased padding
          width: 400,          // increased width
          maxWidth: "90%",     // responsive constraint
          bgcolor: colors.primary[500],
          color: colors.grey[100],
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {title}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}
