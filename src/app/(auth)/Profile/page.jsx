"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/theme";
import AuthLayout from "@/components/AuthLayout";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

export default function Profile() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push("/SignIn");
  };

  if (loading) {
    return (
      <AuthLayout title="Profile">
        <Typography color={colors.grey[100]}>Loading...</Typography>
      </AuthLayout>
    );
  }

  if (error || !user) {
    router.push("/SignIn");
    return null;
  }

  return (
    <AuthLayout title="Profile">
      <Box textAlign="center">
        <Typography variant="h6" color={colors.grey[100]}>
          Hello, {user.email}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Box>
    </AuthLayout>
  );
}
