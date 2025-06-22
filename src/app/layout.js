'use client';

import { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ColorModeContext, useMode } from "@/theme";

// if (!user && typeof window !== 'undefined') {
//   router.push("/SignIn");
// }

export default function RootLayout({ children }) {
  const [theme, colorMode] = useMode();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <title>CyberSec Dashboard</title>
      <body>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ display: "flex" }}>
              <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
              <main style={{ flex: 1 }}>
                {/* <Topbar /> */}
                {children}
              </main>
            </div>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </body>
    </html>
  );
}
