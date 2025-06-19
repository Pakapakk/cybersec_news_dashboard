"use client";

import React, { useState } from "react";
import { TextField, Button, Link, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AuthLayout from "@/components/AuthLayout";
import { tokens } from "@/theme";
import NextLink from "next/link";
import MuiLink from "@mui/material/Link";

export default function SignIn({ onSwitchToSignUp }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = "Email required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
        if (!form.password) errs.password = "Password required";
        else if (form.password.length < 6) errs.password = "Minimum 6 chars";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log("Signing in with", form);
            // Add your sign-in logic here.
        }
    };

    return (
        <AuthLayout title="Sign In">
            <Box component="form" noValidate onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    sx={{
                        "& label.Mui-focused": {
                            color: colors.greenAccent[500], // label on focus
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: colors.grey[300], // default border
                            },
                            "&:hover fieldset": {
                                borderColor: colors.greenAccent[300], // hover
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: colors.greenAccent[500], // focus border
                            },
                        },
                    }}
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    sx={{
                        "& label.Mui-focused": {
                            color: colors.greenAccent[500], // label on focus
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: colors.grey[300], // default border
                            },
                            "&:hover fieldset": {
                                borderColor: colors.greenAccent[300], // hover
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: colors.greenAccent[500], // focus border
                            },
                        },
                    }}
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    sx={{ mt: 2 }}
                >
                    Sign In
                </Button>

                <Box
                    mt={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={1}
                >
                    <Typography
                        variant="body2"
                        component="span"
                        color={colors.grey[100]}
                    >
                        Do not have an account?
                    </Typography>

                    <Link
                        component={NextLink}
                        href="/SignUp"
                        underline="always"
                        variant="body2"
                        sx={{
                            color: colors.grey[100],
                            "&:hover, &:focus": {
                                color: colors.greenAccent[500],
                                textDecoration: "underline",
                            },
                        }}
                    >
                        Sign Up
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
}
