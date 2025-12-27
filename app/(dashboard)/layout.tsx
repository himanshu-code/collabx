"use client";

import React from "react";
import { Box, AppBar, Toolbar, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Protected from "@/components/Protected";
import SideBar from "@/components/ui/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <Protected>
      <Box sx={{ height: "100vh" }}>
        <AppBar
          position="fixed"
          sx={{
            display: { xs: "flex", md: "none" },
            bgcolor: "background.default",
            color: "text.primary",
            boxShadow: "none",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar variant="dense">
            <IconButton onClick={() => setMobileSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* spacer */}
        <Box sx={{ height: { xs: 48, md: 0 } }} />

        <Box display="flex" height="100%">
          <Box sx={{ width: { xs: 0, md: 300 }, flexShrink: 0 }}>
            <SideBar
              mobileOpen={mobileSidebarOpen}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
        </Box>
      </Box>
    </Protected>
  );
}
