import React from "react";
import { Box, Typography } from "@mui/material";
import EditorTopBar from "./EditorTopBar";
import EditorBody from "./EditorBody";

const EditorLayout = () => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <EditorTopBar />
      <EditorBody />
    </Box>
  );
};

export default EditorLayout;
