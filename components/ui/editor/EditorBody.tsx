import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useIsTouch } from "@/hooks/useIsTouch";
import { type EditorData } from "./EditorLayout";
import { EditorCommand } from "./EditorTopBar";
import { getAuth } from "firebase/auth";

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

const BlockInserter = ({ onAdd }: { onAdd: () => void }) => (
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
        userSelect: "none",
      }}
    >
      +
    </Box>
  </Box>
);

const EditorBlock = ({
  block,
  onChange,
  onFocus,
  onInsertAfter,
}: {
  block: Block;
  onChange: (id: string, content: string) => void;
  onFocus: (id: string) => void;
  onInsertAfter: (id: string, type: BlockType) => void;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  const ref =
    block.type === "bulletList" || block.type === "numberedList"
      ? liRef
      : divRef;
  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;

    if (ref.current && ref.current.innerHTML !== block.content) {
      ref.current.innerHTML = block.content || "";
    }
  }, [block.id, block.content, block.type]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (
      e.key === "Enter" &&
      (block.type === "bulletList" || block.type === "numberedList")
    ) {
      e.preventDefault();
      onInsertAfter(block.id, block.type);
    }
  };

  const common = {
    // ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-block-id": block.id,
    onFocus: () => onFocus(block.id),
    onKeyDown: handleKeyDown,
    onInput: (e: React.FormEvent<HTMLElement>) =>
      onChange(block.id, e.currentTarget.innerHTML),
    style: { outline: "none", width: "90%" },
  };

  switch (block.type) {
    case "heading1":
      return <Typography variant="h3" ref={divRef} {...common} />;
    case "heading2":
      return <Typography variant="h4" ref={divRef} {...common} />;
    case "heading3":
      return <Typography ref={divRef} variant="h5" {...common} />;
    case "quote":
      return (
        <Box
          {...common}
          sx={{
            borderLeft: "3px solid",
            borderColor: "divider",
            pl: 2,
            fontStyle: "italic",
          }}
        />
      );
    case "bulletList":
    case "numberedList":
      return <li ref={liRef} {...common} />;
    case "codeBlock":
      return <Box ref={divRef} component="pre" {...common} />;
    default:
      return <Box ref={divRef} {...common} />;
  }
};

const DraggableBlock = ({
  block,
  onDragStart,
  onDragOver,
  onDrop,
  isTouch,
  children,
}: {
  block: Block;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  isTouch: boolean;
  children: React.ReactNode;
}) => {
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault(); // required
        onDragOver(block.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(block.id);
      }}
      sx={{ userSelect: "none" }}
    >
      <Box display="flex" alignItems="flex-start">
        {/* Drag handle */}
        <Box
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            onDragStart(block.id);
          }}
          onMouseDown={(e) => e.stopPropagation()} // prevents caret jump
          onTouchStart={() => {
            longPressTimer.current = window.setTimeout(() => {
              setLongPressActive(true);
            }, 300);
          }}
          onTouchEnd={() => {
            if (longPressTimer.current) {
              clearTimeout(longPressTimer.current);
              longPressTimer.current = null;
              setLongPressActive(false);
            }
          }}
          sx={{
            cursor: "grab",
            pr: 1,
            color: "text.secondary",
            mt: "6px",
            position: "static",
            mr: { xs: "12px", md: "16px" },
          }}
        >
          ⋮⋮
        </Box>

        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};

const EditorBody = ({
  editorData,
  command,
}: {
  editorData: EditorData;
  command: EditorCommand | null;
}) => {
  const isTouch = useIsTouch();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const pendingFocusId = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const lastSavedRef = useRef<string>("");
  const isSavingRef = useRef(false);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (id: string) => {
    // Optional visual feedback later
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === draggedId);
      const to = prev.findIndex((b) => b.id === targetId);
      if (from === -1 || to === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });

    pendingFocusId.current = draggedId;
    setDraggedId(null);
  };

  useEffect(() => {
    if (editorData?.blocks) setBlocks(editorData.blocks);
  }, [editorData]);

  const handleBlockChange = (id: string, content: string) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));

  const insertBlockAfter = (afterId: string, type: BlockType = "paragraph") => {
    const newId = crypto.randomUUID();

    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === afterId);
      if (index === -1) return prev;

      const newBlock: Block = {
        id: newId,
        type,
        content: "",
      };

      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
    pendingFocusId.current = newId;
  };

  useEffect(() => {
    if (!command || !activeBlockId) return;

    if (["bold", "italic", "underline"].includes(command.type)) {
      document.execCommand(command.type);
    } else if (command.type === "insertLink") {
      const url = prompt("Enter URL");
      if (url) document.execCommand("createLink", false, url);
    } else {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === activeBlockId ? { ...b, type: command.type as BlockType } : b
        )
      );
    }
  }, [command]);

  useEffect(() => {
    if (!pendingFocusId.current) return;
    const id = pendingFocusId.current;
    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-block-id="${id}"]`
      ) as HTMLElement | null;
      if (!el) return;

      el?.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      pendingFocusId.current = null;
    });
  }, [blocks]);

  const saveBlock = async (blocksToSave: Block[]) => {
    if (!editorData?._id) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const payload = JSON.stringify(blocksToSave);
    if (payload === lastSavedRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;

      const token = await user.getIdToken();
      const res = await fetch(`/api/documents/${editorData._id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blocks: blocksToSave }),
      });
      if (res.ok) {
        lastSavedRef.current = payload;
      } else {
        console.error("Save Failed", await res.text());
      }
    } catch (error) {
      console.error("Save err", error);
    } finally {
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    if (!blocks.length) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveBlock(blocks);
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [blocks]);

  return (
    <Box sx={{ px: 4, py: 3 }}>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        {(() => {
          const rendered: React.ReactNode[] = [];
          let i = 0;

          while (i < blocks.length) {
            const block = blocks[i];

            if (block.type === "bulletList" || block.type === "numberedList") {
              const listType = block.type;
              const items: Block[] = [];

              while (i < blocks.length && blocks[i].type === listType) {
                items.push(blocks[i]);
                i++;
              }

              const lastItem = items[items.length - 1];

              rendered.push(
                <React.Fragment key={items[0].id}>
                  <Box
                    component={listType === "bulletList" ? "ul" : "ol"}
                    sx={{ pl: 0, m: 0 }}
                    key={items[0].id}
                  >
                    {items.map((item) => (
                      <DraggableBlock
                        key={item.id}
                        block={item}
                        onDragStart={handleDragStart}
                        onDragOver={() => {}}
                        onDrop={handleDrop}
                        isTouch={isTouch}
                      >
                        <EditorBlock
                          block={item}
                          onChange={handleBlockChange}
                          onFocus={(id) => {
                            setActiveBlockId(id);
                            pendingFocusId.current = id;
                          }}
                          onInsertAfter={insertBlockAfter}
                        />
                      </DraggableBlock>
                    ))}
                  </Box>
                  <BlockInserter onAdd={() => insertBlockAfter(lastItem.id)} />
                </React.Fragment>
              );
            } else {
              rendered.push(
                <React.Fragment key={block.id}>
                  <DraggableBlock
                    block={block}
                    onDragStart={handleDragStart}
                    onDragOver={() => {}}
                    onDrop={handleDrop}
                    isTouch={isTouch}
                  >
                    <EditorBlock
                      block={block}
                      onChange={handleBlockChange}
                      onFocus={(id) => {
                        setActiveBlockId(id);
                        pendingFocusId.current = id;
                      }}
                      onInsertAfter={insertBlockAfter}
                    />
                  </DraggableBlock>

                  <BlockInserter onAdd={() => insertBlockAfter(block.id)} />
                </React.Fragment>
              );
              i++;
            }
          }

          return rendered;
        })()}
      </Box>
    </Box>
  );
};

export default EditorBody;
