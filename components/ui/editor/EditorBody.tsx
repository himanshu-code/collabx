import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useIsTouch } from "@/hooks/useIsTouch";
import { type EditorData } from "./EditorLayout";
import { EditorCommand } from "./EditorTopBar";
type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "quote"
  | "codeBlock";

export type Block = {
  id: string;
  type: BlockType;
  content: string;
};
const BlockInserter = ({ onAdd }: { onAdd: () => void }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 1,
        opacity: 0.4,
        cursor: "pointer",
        "&:hover": { opacity: 1 },
      }}
      onClick={onAdd}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        +
      </Box>
    </Box>
  );
};

const EditorBlock = ({
  block,
  onChange,
  onFocus,
}: {
  block: Block;
  onChange: (id: string, content: string) => void;
  onFocus: (id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (ref.current.innerHTML !== block.content) {
      ref.current.innerHTML = block.content || "";
    }
  }, [block.content, block.type]);

  switch (block.type) {
    case "heading1":
      return (
        <Typography
          ref={ref}
          variant="h3"
          contentEditable
          data-block-id={block.id}
          suppressContentEditableWarning
          sx={{ outline: "none", mb: { xs: 2, md: 1 }, width: "90%" }}
          onFocus={() => onFocus(block.id)}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            onChange(block.id, html);
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </Typography>
      );
    case "heading2":
      return (
        <Typography
          ref={ref}
          variant="h4"
          contentEditable
          data-block-id={block.id}
          suppressContentEditableWarning
          onFocus={() => onFocus(block.id)}
          sx={{ outline: "none", mb: { xs: 2, md: 1 }, width: "90%" }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            onChange(block.id, html);
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </Typography>
      );
    case "heading3":
      return (
        <Typography
          ref={ref}
          variant="h5"
          contentEditable
          data-block-id={block.id}
          suppressContentEditableWarning
          onFocus={() => onFocus(block.id)}
          sx={{ outline: "none", mb: { xs: 2, md: 1 }, width: "90%" }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            onChange(block.id, html);
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </Typography>
      );

    case "quote":
      return (
        <Box
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-block-id={block.id}
          onFocus={() => onFocus(block.id)}
          sx={{
            borderLeft: "3px solid",
            borderColor: "divider",
            pl: 2,
            color: "text.secondary",
            fontStyle: "italic",
            mb: 1,
            outline: "none",
            width: "90%",
          }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            onChange(block.id, html);
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </Box>
      );

    case "bulletList":
      return (
        <li
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-block-id={block.id}
          onFocus={() => onFocus(block.id)}
          style={{ marginLeft: 20, outline: "none", width: "90%" }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </li>
      );

    case "numberedList":
      return (
        <li
          ref={ref}
          contentEditable
          data-block-id={block.id}
          suppressContentEditableWarning
          onFocus={() => onFocus(block.id)}
          style={{
            marginLeft: 20,
            outline: "none",
            listStyleType: "decimal",
            width: "90%",
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </li>
      );

    case "paragraph":
      return (
        <Box
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => onFocus(block.id)}
          sx={{ outline: "none", mb: { xs: 2, md: 1 }, width: "90%" }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML
              .replace(/<div>/g, "<br>")
              .replace(/<\/div>/g, "")
              .replace(/<br><br>/g, "<br>");
            onChange(block.id, html);
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
        </Box>
      );
    case "codeBlock":
      return (
        <Box
          ref={ref}
          component="pre"
          contentEditable
          suppressContentEditableWarning
          onFocus={() => onFocus(block.id)}
          sx={{
            outline: "none",
            mb: 1,
            bgcolor: "grey.100",
            fontFamily: "monospace",
            p: 1,
            borderRadius: 1,
            overflowX: "auto",
            width: "90%",
          }}
        >
          {/**<div dangerouslySetInnerHTML={{ __html: block.content || "" }} />**/}
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
  onChange,
  onFocus,
}: {
  block: Block;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  isTouch: boolean;
  onChange: (id: string, content: string) => void;
  onFocus: (id: string) => void;
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

        <EditorBlock block={block} onChange={onChange} onFocus={onFocus} />
      </Box>
    </Box>
  );
};

const EditorBody = ({
  editorData,
  command,
}: {
  editorData: EditorData;
  command: EditorCommand;
}) => {
  const isTouch = useIsTouch();
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

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
  const handleBlockChange = (id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };
  useEffect(() => {
    if (editorData?.blocks) {
      setBlocks(editorData.blocks);
    }
  }, [editorData]);

  const applyCommand = (cmd: EditorCommand) => {
    console.log("cmd executed", cmd);
    if (!activeBlockId) return;

    switch (cmd.type) {
      case "bold":
        document.execCommand("bold");
        return;

      case "italic":
        document.execCommand("italic");
        return;

      case "underline":
        document.execCommand("underline");
        return;

      // case "codeBlock":
      //   document.execCommand(
      //     "insertHTML",
      //     false,
      //     `<code>${window.getSelection()?.toString()}</code>`
      //   );
      //   return;

      case "insertLink": {
        const url = prompt("Enter URL");
        if (url) document.execCommand("createLink", false, url);
        return;
      }
      default:
        setBlocks((prev) =>
          prev.map((b) => {
            if (b.id !== activeBlockId) return b;
            return { ...b, type: cmd.type as BlockType, content: b.content };
          })
        );
    }
  };

  const insertBlockAfter = (afterId: string) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === afterId);
      if (index == -1) return prev;
      const newBlock: Block = {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: "",
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
  };
  useEffect(() => {
    if (command) {
      applyCommand(command);
    }
  }, [command]);
  useEffect(() => {
    const last = blocks[blocks.length - 1];
    if (!last) return;

    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-block-id="${last.id}"]`
      ) as HTMLElement;
      el?.focus();
    });
  }, [blocks.length]);

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
          <React.Fragment key={block.id}>
            <DraggableBlock
              block={block}
              onDragStart={handleDragStart}
              onDragOver={() => {}}
              onDrop={handleDrop}
              isTouch={isTouch}
              onFocus={setActiveBlockId}
              onChange={handleBlockChange}
            />
            <BlockInserter onAdd={() => insertBlockAfter(block.id)} />
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default EditorBody;
