import React from "react";
import { Box, Typography } from "@mui/material";
import { set } from "mongoose";
import { useIsTouch } from "@/hooks/useIsTouch";
import { clear } from "console";
type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "quote"
  | "codeBlock";

type Block = {
  id: string;
  type: BlockType;
  content: string;
};

const EditorBlock = ({ block }: { block: Block }) => {
  switch (block.type) {
    case "heading1":
      return (
        <Typography
          variant="h3"
          contentEditable
          suppressContentEditableWarning
          sx={{ outline: "none", mb: { xs: 2, md: 1 } }}
        >
          {block.content}
        </Typography>
      );
    case "heading2":
      return (
        <Typography
          variant="h4"
          contentEditable
          suppressContentEditableWarning
          sx={{ outline: "none", mb: { xs: 2, md: 1 } }}
        >
          {block.content}
        </Typography>
      );
    case "heading3":
      return (
        <Typography
          variant="h5"
          contentEditable
          suppressContentEditableWarning
          sx={{ outline: "none", mb: { xs: 2, md: 1 } }}
        >
          {block.content}
        </Typography>
      );

    case "quote":
      return (
        <Box
          contentEditable
          suppressContentEditableWarning
          sx={{
            borderLeft: "3px solid",
            borderColor: "divider",
            pl: 2,
            color: "text.secondary",
            fontStyle: "italic",
            mb: 1,
            outline: "none",
          }}
        >
          {block.content}
        </Box>
      );

    case "bulletList":
      return (
        <li
          contentEditable
          suppressContentEditableWarning
          style={{ marginLeft: 20, outline: "none" }}
        >
          {block.content}
        </li>
      );

    case "numberedList":
      return (
        <li
          contentEditable
          suppressContentEditableWarning
          style={{ marginLeft: 20, outline: "none", listStyleType: "decimal" }}
        >
          {block.content}
        </li>
      );

    case "paragraph":
      return (
        <Box
          contentEditable
          suppressContentEditableWarning
          sx={{ outline: "none", mb: { xs: 2, md: 1 } }}
        >
          {block.content}
        </Box>
      );
    case "codeBlock":
      return (
        <Box
          component="pre"
          contentEditable
          suppressContentEditableWarning
          sx={{
            outline: "none",
            mb: 1,
            bgcolor: "grey.100",
            fontFamily: "monospace",
            p: 1,
            borderRadius: 1,
            overflowX: "auto",
          }}
        >
          {block.content}
        </Box>
      );
    default:
      return null;
  }
};

const DraggableBlock = ({
  block,
  onDragStart,
  onDragOver,
  onDrop,
  isTouch,
}: {
  block: Block;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  isTouch: boolean;
}) => {
  const [longPressActive, setLongPressActive] = React.useState(false);
  const longPressTimer = React.useRef<number | null>(null);
  return (
    <Box
      onDragOver={(e) => {
        if (!isTouch || longPressActive) {
          e.preventDefault();
          onDragOver(block.id);
        }
      }}
      onDrop={() => {
        if (!isTouch || longPressActive) {
          onDrop(block.id);
        }
      }}
      sx={{ userSelect: "none" }}
    >
      <Box display="flex">
        {/* Drag Handle */}
        {/* {!isTouch && ( */}
        <Box
          draggable={!isTouch || longPressActive}
          onDragStart={() => onDragStart(block.id)}
          onTouchStart={() => {
            longPressTimer.current = window.setTimeout(() => {
              setLongPressActive(true);
            }, 350);
          }}
          onTouchEnd={() => {
            if (longPressTimer.current) {
              clearTimeout(longPressTimer.current);
              longPressTimer.current = null;
            }
          }}
          onTouchMove={() => {
            if (longPressTimer.current) {
              clearTimeout(longPressTimer.current);
              longPressTimer.current = null;
            }
          }}
          sx={{
            cursor: "grab",
            pr: 1,
            color: "text.secondary",
            ml: { xs: "16px", md: "-16px" },
          }}
        >
          ⋮⋮
        </Box>
        {/* )} */}

        <EditorBlock block={block} />
      </Box>
    </Box>
  );
};

const EditorBody = () => {
  const isTouch = useIsTouch();
  const [blocks, setBlocks] = React.useState<Block[]>([
    { id: "1", type: "heading1", content: "Project Overview" },
    {
      id: "2",
      type: "paragraph",
      content: "This document describes the project goals.",
    },
  ]);

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };
  const handleDrop = (targetId: string) => {
    if (draggedId === null || draggedId === targetId) return;

    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === draggedId);
      const to = prev.findIndex((b) => b.id === targetId);
      if (from === -1 || to === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
    setDraggedId(null);
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        bgcolor: "background.paper",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto", width: "100%" }}>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: 14,
            userSelect: "none",
          }}
        >
          Start typing…
        </Typography>
        {blocks.map((block) => (
          <DraggableBlock
            key={block.id}
            block={block}
            onDragStart={handleDragStart}
            onDragOver={() => {}}
            onDrop={handleDrop}
            isTouch={isTouch}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EditorBody;
