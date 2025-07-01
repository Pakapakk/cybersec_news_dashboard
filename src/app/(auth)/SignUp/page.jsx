"use client";

import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GoogleButton from "react-google-button";
import AuthLayout from "@/components/AuthLayout";
import { tokens } from "@/theme";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function SignUp() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password required";
    else if (form.password.length < 6) errs.password = "Minimum 6 chars";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFirebaseError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      router.push("/SignIn");
    } catch (e) {
      const message = e.message.replace(/^Firebase: Error \(auth\/(.+?)\)\.?$/, "$1").replace(/-/g, " ");
      setFirebaseError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFirebaseError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (e) {
      const message = e.message.replace(/^Firebase: Error \(auth\/(.+?)\)\.?$/, "$1").replace(/-/g, " ");
      setFirebaseError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <TextField
          fullWidth margin="normal" label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={!!errors.email} helperText={errors.email}
          sx={{
            "& label.Mui-focused": { color: colors.greenAccent[500] },
            "& .MuiOutlinedInput-root fieldset": { borderColor: colors.grey[300] },
            "& .MuiOutlinedInput-root:hover fieldset": { borderColor: colors.greenAccent[300] },
            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
          }}
        />

        <TextField
          fullWidth margin="normal" label="Password" type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={!!errors.password} helperText={errors.password}
          sx={{
            "& label.Mui-focused": { color: colors.greenAccent[500] },
            "& .MuiOutlinedInput-root fieldset": { borderColor: colors.grey[300] },
            "& .MuiOutlinedInput-root:hover fieldset": { borderColor: colors.greenAccent[300] },
            "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
          }}
        />

        {firebaseError && (
          <Typography color="error" variant="body2">{firebaseError}</Typography>
        )}

        <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }} disabled={loading}>
          Sign Up
        </Button>

        <Box textAlign="center" my={2}>
          <Typography variant="body2" color={colors.grey[400]}>— or —</Typography>
        </Box>

        <Box display="flex" justifyContent="center">
          <GoogleButton
            onClick={handleGoogleSignUp}
            label="Sign up with Google"
            disabled={loading}
          />
        </Box>

        <Box mt={2} display="flex" justifyContent="center" alignItems="center" gap={1}>
          <Typography variant="body1" color={colors.grey[100]}>Have an account?</Typography>
          <NextLink href="/SignIn" passHref legacyBehavior>
            <Typography component="a" variant="body1" sx={{
              color: colors.grey[100], textDecoration: "underline",
              "&:hover": { color: colors.greenAccent[500] },
            }}>
              Sign In
            </Typography>
          </NextLink>
        </Box>
      </Box>
    </AuthLayout>
  );
}
