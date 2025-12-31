import React, { useState } from "react";
import {
  Modal,
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { getAuth } from "firebase/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ShareModal = ({
  open,
  onClose,
  documentId,
}: {
  open: boolean;
  onClose: () => void;
  documentId: string;
}) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("editor");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleEmailChange = (value: string) => {
    setUserId(value);
    if (!value) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid Email Address");
    } else {
      setEmailError(null);
    }
  };
  const handleShare = async () => {
    try {
      console.log("Sharing with:", userId, "as", role);

      const user = getAuth().currentUser;
      if (!user) {
        setError("You must be signed in");
        return;
      }
      setLoading(true);

      const token = await user.getIdToken();

      const res = await fetch(`/api/shareDocument/${documentId}`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify({ email: userId, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to share doc");
      }
      setSuccess(true);
      setUserId("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error while sharing");
    }
    // API call later
  };
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-header">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" id="modal-header">
            Share document
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">User added successfully</Alert>}
          <TextField
            label="Email"
            fullWidth
            value={userId}
            required={true}
            type="email"
            error={!!emailError}
            helperText={emailError || " "}
            onChange={(e) => handleEmailChange(e.target.value)}
          />

          <TextField
            select
            label="Permission"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="viewer">Viewer (can view)</MenuItem>
            <MenuItem value="editor">Editor (can edit)</MenuItem>
          </TextField>

          <Button
            variant="contained"
            onClick={handleShare}
            disabled={!userId.trim() || !!emailError || loading}
          >
            {loading ? <CircularProgress size={22} /> : "Share"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ShareModal;
