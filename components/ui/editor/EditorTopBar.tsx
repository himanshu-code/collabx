import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Toolbar,
  Typography,
  Button,
  AvatarGroup,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Menu,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link,
  Image,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Title,
  MoreHoriz,
  Comment,
  Share,
  History,
} from "@mui/icons-material";
const EditorTopBar = () => {
  const toggleSx = {
    border: "none",
    borderRadius: 1,
    "&.Mui-selected": {
      bgcolor: "action.selected",
    },
  } as const;

  const inlineButtons = [
    { value: "Bold", aria: "bold", icon: <FormatBold /> },
    { value: "Italic", aria: "italic", icon: <FormatItalic /> },
    { value: "Underline", aria: "underline", icon: <FormatUnderlined /> },
  ];

  const mediaButtons = [
    { value: "Link", aria: "link", icon: <Link /> },
    { value: "Image", aria: "image", icon: <Image /> },
    { value: "Code", aria: "code", icon: <Code /> },
  ];

  const blockButtons = [
    { value: "Heading1", aria: "heading1", icon: <Title fontSize="small" /> },
    { value: "Heading2", aria: "heading2", icon: <Title fontSize="inherit" /> },
    { value: "Bullet list", aria: "bullet list", icon: <FormatListBulleted /> },
    {
      value: "Numbered list",
      aria: "numbered list",
      icon: <FormatListNumbered />,
    },
    { value: "Quote", aria: "Quote", icon: <FormatQuote /> },
  ];

  return (
    <Box
      sx={{
        height: 56,
        borderBottom: "1px solid",
        borderColor: "divider",
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            px: 1,
            borderRight: "1px solid",
            display: "flex",
            alignItems: "center",
            borderColor: "divider",
          }}
        >
          <ToggleButtonGroup size="small" exclusive={false}>
            {inlineButtons.map((b) => (
              <Tooltip key={b.value} title={b.value} arrow>
                <ToggleButton value={b.value} aria-label={b.aria} sx={toggleSx}>
                  {b.icon}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box
          sx={{
            px: 1,
            borderRight: "1px solid",
            display: "flex",
            alignItems: "center",
            borderColor: "divider",
          }}
        >
          <ToggleButtonGroup size="small" exclusive>
            {mediaButtons.map((b) => (
              <Tooltip key={b.value} title={b.value} arrow>
                <ToggleButton value={b.value} aria-label={b.aria} sx={toggleSx}>
                  {b.icon}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box
          sx={{
            px: 1,
            borderRight: "1px solid",
            display: "flex",
            alignItems: "center",
            borderColor: "divider",
          }}
        >
          <ToggleButtonGroup size="small" exclusive>
            {blockButtons.map((b) => (
              <Tooltip key={b.value} title={b.value} arrow>
                <ToggleButton value={b.value} aria-label={b.aria} sx={toggleSx}>
                  {b.icon}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            borderRight: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="text"
            startIcon={<History />}
            size="small"
            sx={{ display: { xs: "none", lg: "flex" }, textTransform: "none" }}
          >
            Last edited 2m ago
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            borderRight: "1px solid",
            borderColor: "divider",
          }}
        >
          <AvatarGroup max={3} spacing="small">
            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
            <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
            <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
          </AvatarGroup>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            gap: 1,
          }}
        >
          <Button
            variant="text"
            startIcon={<Comment fontSize="small" />}
            size="small"
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Comment
          </Button>
          <Button
            variant="contained"
            startIcon={<Share fontSize="small" />}
            size="small"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Share
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditorTopBar;
