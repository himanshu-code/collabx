"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { getMuiTheme } from "@/lib/theme";
import { useMemo, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mode, setMode] = useState<"light" | "dark">("light");
  const theme = useMemo(() => getMuiTheme(mode), [mode]);


  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
