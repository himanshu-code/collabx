"use client";
import { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import EditorTopBar, { EditorCommand } from "./EditorTopBar";
import EditorBody from "./EditorBody";
import ShareModal from "@/components/ui/ShareModal";
import { Check, Edit } from "@mui/icons-material";

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
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [title, setTitle] = useState<string>(editorData.title);
  const [titleError, setTitleError] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const handleTitleChange = (newTitle: string) => {
    if (newTitle.length > 20) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setTitle(newTitle);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <EditorTopBar
        onCommand={setCommand}
        onShareClick={setOpenShare}
        activeUsers={activeUsers}
      />
      <ShareModal
        open={openShare}
        onClose={() => setOpenShare(false)}
        documentId={editorData?._id}
      />
      <Box sx={{ display: "flex", alignItems: "center", px: { xs: 2, md: 4 }, pt: 2, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        {!editingTitle && (
          <>
            <Typography variant="h4" sx={{ px: { xs: 2, md: 4 }, pt: 2, pb: 1 }}>
              {title}
            </Typography>
            <IconButton sx={{ border: "1px solid", borderColor: "divider" }} onClick={() => setEditingTitle(true)} >
              <Edit />
            </IconButton>
          </>
        )}
        {editingTitle && (
          <>
            <TextField
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            <IconButton sx={{ border: "1px solid", borderColor: "divider" }} onClick={() => setEditingTitle(false)} >
              <Check />
            </IconButton>
          </>
        )}
        {titleError && (
          <Typography variant="body2" color="error">
            Title must be less than 20 characters.
          </Typography>
        )}
      </Box>
      <EditorBody
        docTitle={title}
        onTitleChange={setTitle}
        editorData={editorData}
        command={command}
        onUsersChange={setActiveUsers}
      />
    </Box>
  );
};

export default EditorLayout;
