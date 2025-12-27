import React, { use, useEffect } from "react";
import {
  Drawer,
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { AccountCircle, KeyboardArrowDown, Search } from "@mui/icons-material";
import { firebaseLogout } from "@/lib/firebaseLogout";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { createDocument } from "@/lib/createDocument";
import { getDocuments } from "@/lib/getDocuments";
import { set } from "mongoose";

interface DocumentInformation {
  createdAt: string;
  ownerId: string;
  title: string;
  updatedAt: string;
  _id: string;
}
const SideBar = ({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) => {
  const { user, loading } = useAuth();
  const photoURL = React.useMemo(
    () => user?.photoURL || undefined,
    [user?.photoURL]
  );
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [documentList, setDocumentList] = React.useState<DocumentInformation[]>(
    []
  );
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleLogout = async () => {
    await firebaseLogout();
    router.push("/login");
  };
  useEffect(() => {
    console.log(user);
  }, [user]);
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    async function fetchDocuments() {
      const docs: DocumentInformation[] = await getDocuments();
      console.log(docs);
      setDocumentList(docs);
    }
    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    const newDoc = await createDocument();
    router.push(`/editor/${newDoc.documentId}`);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
            px: 2,
            py: 1.5,
            bgcolor: "background.default",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box py={2} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            {!loading && user?.photoURL && (
              <Avatar
                src={photoURL}
                alt={user?.displayName || "profile"}
                sx={{ width: 40, height: 40, marginRight: "16px" }}
              />
            )}
            <Typography variant="subtitle1" fontWeight={500}>
              {user?.displayName}'s Workspace
            </Typography>
            <IconButton onClick={handleClick}>
              <KeyboardArrowDown fontSize="small" />
            </IconButton>
            <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search pages"
            variant="standard"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                disableUnderline: true,
              },
            }}
            sx={{
              mb: 1,
              bgcolor: "action.hover",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          />
        </Box>
        <Box
          py={2}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          <List>
            {documentList.map((doc) => (
              <ListItemButton
                key={doc._id}
                onClick={(e) => {
                  router.push(`/editor/${doc._id}`);
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": { bgcolor: "action.selected" },
                }}
              >
                {" "}
                <ListItemText primary={doc.title} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Box mt={2}>
          <Button
            fullWidth
            onClick={handleCreateDocument}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "text.secondary",
              fontSize: 13,
              pl: 1.5,
            }}
          >
            + New File
          </Button>
        </Box>
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 300,
            boxSizing: "border-box",
            px: 2,
            py: 1.5,
            bgcolor: "background.default",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box py={2} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography variant="subtitle1" fontWeight={500}>
              Himanshu’s Workspace
            </Typography>
            <KeyboardArrowDown fontSize="small" />
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search pages"
            variant="standard"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                disableUnderline: true,
              },
            }}
            sx={{
              mb: 1,
              bgcolor: "action.hover",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          />
        </Box>
        <Box py={2} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <List>
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": { bgcolor: "action.selected" },
              }}
            >
              {" "}
              <ListItemText primary="Product RoadMap 2024" />
            </ListItemButton>
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": { bgcolor: "action.selected" },
              }}
            >
              {" "}
              <ListItemText primary="Design System" />
            </ListItemButton>
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": { bgcolor: "action.selected" },
              }}
            >
              {" "}
              <ListItemText primary="Meeting Notes" />
            </ListItemButton>
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": { bgcolor: "action.selected" },
              }}
            >
              {" "}
              <ListItemText primary="Team Guidelines" />
            </ListItemButton>
          </List>
        </Box>
        <Box mt={2}>
          <Button
            onClick={handleCreateDocument}
            fullWidth
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "text.secondary",
              fontSize: 13,
              pl: 1.5,
            }}
          >
            + New File
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default SideBar;
