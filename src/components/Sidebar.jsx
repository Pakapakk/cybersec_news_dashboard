"use client";

import { useState, useContext } from "react";
import { usePathname } from "next/navigation";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens, ColorModeContext } from "../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const Item = ({ title, to, icon }) => {
    const pathname = usePathname();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <MenuItem
            active={pathname === to}
            style={{ color: colors.grey[100] }}
            icon={icon}
        >
            <Typography>{title}</Typography>
            <Link href={to} passHref>
                <span />
            </Link>
        </MenuItem>
    );
};

const Sidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const colorMode = useContext(ColorModeContext);

    return (
        <Box
            sx={{
                height: "100vh",
                position: "sticky",
                top: 0,
                overflowY: "auto",
                display: "flex",
                justifyContent: "space-between",
                "& .pro-sidebar-inner": {
                    background: `${colors.primary[400]} !important`,
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important",
                },
                "& .pro-inner-item": {
                    padding: "5px 35px 5px 20px !important",
                },
                "& .pro-inner-item:hover": {
                    color: "#868dfb !important",
                },
                "& .pro-menu-item.active": {
                    color: "#6870fa !important",
                },
            }}
        >
            <ProSidebar collapsed={isCollapsed}>
                <Menu iconShape="square">
                    {/* LOGO AND MENU ICON */}
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                        style={{
                            margin: "10px 0 20px 0",
                            color: colors.grey[100],
                        }}
                    >
                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px"
                            >
                                <Typography variant="h3" color={colors.grey[100]}>
                                    Dashboard
                                </Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} />
                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            News
                        </Typography>
                        <Item title="News" to="/NewsList" icon={<ArticleIcon />} />

                        {/* Dark Mode Toggle Button */}
                        <Box title="Appearance" display="flex" justifyContent="left" p={2} paddingTop={95}>
                            <IconButton title="Appearance" onClick={colorMode.toggleColorMode}>
                                {theme.palette.mode === "dark" ? ( <DarkModeOutlinedIcon title="Appearance" /> ) : ( <LightModeOutlinedIcon title="Appearance" /> )}
                            </IconButton>
                        </Box>
                    </Box>
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;
