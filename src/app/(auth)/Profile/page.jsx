"use client";

import React, { useEffect } from "react";
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

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await fetch("/api/signout", { method: "POST" }); // clear authToken cookie
      await auth.signOut(); // sign out from Firebase
      router.push("/SignIn"); // redirect
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Redirect unauthenticated users on mount
  useEffect(() => {
    if (!loading && (!user || error)) {
      router.push("/SignIn");
    }
  }, [user, loading, error, router]);

  if (loading) {
    return (
      <AuthLayout title="Profile">
        <Typography color={colors.grey[100]}>Loading...</Typography>
      </AuthLayout>
    );
  }

  if (!user) return null; // avoid accessing user.email before it's ready

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
