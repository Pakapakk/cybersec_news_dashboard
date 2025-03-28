// import { Source_Sans_3 } from "next/font/google";
// import "./globals.css";
// import { useMode, ColorModeContext } from "@/theme";
// import Sidebar from "@/components/Sidebar";
// import Topbar from "@/components/Topbar";

// const sourceSans = Source_Sans_3 ({
//   variable: '--font-source-sans',
//   subsets: ['latin'], 
//   weight: ["300", "400", "600", "700"],
//   display: 'swap',
// });

// // Metadata for the layout
// export const metadata = {
//   title: "CyberSec News Dashboard",
//   description: "Generated by create next app",
// };

// export default function RootLayout({ children }) {

//   return (
//     <html lang="en">
//       <body className={sourceSans.variable}
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           height: "100vh",
//           width: "100vw",
//           margin: 0,
//           // overflow: "hidden",
//         }}
//       >
//         {/* Sidebar */}
//         <div
//           style={{
//             flex: "0 0 1px",
//             display: "flex",
//             // flexDirection: "column",
//           }}
//         >
//           <Sidebar />
//         </div>

//         {/* Main Content Area */}
//         <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
//           {/* Topbar */}
//             <Topbar />
//           {/* Main Content */}
//           <main
//             style={{
//               flexGrow: 1,
//               // padding: "0px", // Reduced padding between rows and content
//               // boxSizing: "border-box",
//               overflow: "hidden",
//             }}
//           >
//             {children}
//           </main>
//         </div>
//       </body>
//     </html>
//   );
// }

'use client';

import { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ColorModeContext, useMode } from "@/theme";


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
