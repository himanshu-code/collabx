"use client";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import EditorTopBar, { EditorCommand } from "./EditorTopBar";
import EditorBody from "./EditorBody";
import ShareModal from "@/components/ui/ShareModal";

export interface EditorData {
  createdAt: string;
  ownerId: string;
  title: string;
  updatedAt: string;
  _id: string;
  blocks: any[];
}

const EditorLayout = ({ editorData }: { editorData: EditorData }) => {
  const [command, setCommand] = useState<EditorCommand | null>(null);
  const [openShare, setOpenShare] = useState<boolean>(false);
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <EditorTopBar onCommand={setCommand} onShareClick={setOpenShare} />
      <ShareModal
        open={openShare}
        onClose={() => setOpenShare(false)}
        documentId={editorData?._id}
      />
      <Typography variant="h4" sx={{ px: { xs: 2, md: 4 }, pt: 2, pb: 1 }}>
        {editorData.title}
      </Typography>
      <EditorBody editorData={editorData} command={command} />
    </Box>
  );
};

export default EditorLayout;
