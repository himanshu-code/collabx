import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useIsTouch } from "@/hooks/useIsTouch";
import { type EditorData } from "./EditorLayout";
import { EditorCommand } from "./EditorTopBar";
import { getAuth } from "firebase/auth";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";


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

  >
    <Box
      onClick={onAdd}
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
  onDelete,
}: {
  block: Block;
  onChange: (id: string, content: string) => void;
  onFocus: (id: string) => void;
  onInsertAfter: (id: string, type: BlockType) => void;
  onDelete: (id: string) => void;
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
      e.key === "Backspace" &&
      ref.current &&
      ref.current.innerText.trim() === ""
    ) {
      e.preventDefault();
      onDelete(block.id);
    }
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
          ref={divRef}
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

        <Box sx={{ flex: 1, position: "relative" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const EditorBody = ({
  editorData,
  command,
  onUsersChange,
}: {
  editorData: EditorData;
  command: EditorCommand | null;
  onUsersChange?: (users: any[]) => void;
}) => {
  const isTouch = useIsTouch();
  const [blocks, setBlocks] = useState<Block[]>(editorData.blocks || []);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeUsers, setActiveUsersInternal] = useState<any[]>([]);
  const pendingFocusId = useRef<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const yDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (id: string) => {
    // Optional visual feedback later
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId || !yDocRef.current) return;

    const yBlocks = yDocRef.current.getArray<Block>("blocks");
    const allBlocks = yBlocks.toArray();
    const from = allBlocks.findIndex((b) => b.id === draggedId);
    const to = allBlocks.findIndex((b) => b.id === targetId);

    if (from !== -1 && to !== -1) {
      yDocRef.current.transact(() => {
        const movedBlock = yBlocks.get(from);
        yBlocks.delete(from);
        yBlocks.insert(to, [movedBlock]);
      });
    }
    setDraggedId(null);
  };

  const handleBlockChange = (id: string, content: string) => {
    if (!yDocRef.current) return;

    const yBlocks = yDocRef.current.getArray<Block>("blocks");
    const index = yBlocks.toArray().findIndex((b) => b.id === id);
    if (index !== -1) {
      yDocRef.current.transact(() => {
        const block = yBlocks.get(index);
        yBlocks.delete(index);
        yBlocks.insert(index, [{ ...block, content }])
      });
    }
  }

  const insertBlockAfter = (afterId: string, type: BlockType = "paragraph") => {
    if (!yDocRef.current) return;

    const yBlocks = yDocRef.current.getArray<Block>("blocks");
    const index = yBlocks.toArray().findIndex((b) => b.id === afterId);
    if (index !== -1) {
      const newBlock: Block = {

        id: crypto.randomUUID(),
        type,
        content: ""
      };
      yDocRef.current.transact(() => {
        yBlocks.insert(index + 1, [newBlock]);
      })
    }
  };

  const deleteBlock = (id: string) => {
    if (!yDocRef.current) return;
    const yBlocks = yDocRef.current.getArray<Block>("blocks");
    const index = yBlocks.toArray().findIndex((b) => b.id === id);
    if (index !== -1) {
      yDocRef.current.transact(() => {
        yBlocks.delete(index);
      });
    }
  };



  useEffect(() => {
    if (!editorData?._id) {
      return;
    }
    const ydoc = new Y.Doc();
    yDocRef.current = ydoc;
    const provider = new WebsocketProvider(process.env.NEXT_PUBLIC_WS_SERVER_URL!, editorData._id, ydoc);
    providerRef.current = provider;
    const yBlocks = ydoc.getArray("blocks");
    const observer = () => {
      const currentBlocks = yBlocks.toArray() as Block[];
      if (currentBlocks.length > 0) {
        setBlocks(currentBlocks);
      }
    };
    yBlocks.observe(observer);

    // Initial sync
    provider.on("sync", (isSynced: boolean) => {
      if (isSynced) {
        const syncedBlocks = yBlocks.toArray() as Block[];
        if (syncedBlocks.length > 0) {
          setBlocks(syncedBlocks);
        }
      }
    });

    // Awareness handling
    const auth = getAuth();
    const user = auth.currentUser;
    const name = user?.displayName || user?.email?.split("@")[0] || "Anonymous";
    const photo = user?.photoURL || "";
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    provider.awareness.setLocalStateField("user", {
      name,
      photo,
      color,
      focusedId: activeBlockId,
    });

    const awarenessObserver = () => {
      const states = provider.awareness.getStates();
      const users: any[] = [];
      states.forEach((state: any, clientID) => {
        if (state.user) {
          users.push({
            clientID,
            ...state.user,
          });
        }
      });
      if (onUsersChange) {
        onUsersChange(users);
      }
      setActiveUsersInternal(users);
    };

    provider.awareness.on("change", awarenessObserver);

    return () => {
      yBlocks.unobserve(observer);
      provider.awareness.off("change", awarenessObserver);
      provider.destroy();
      ydoc.destroy();
    };
  }, [editorData._id, onUsersChange])



  useEffect(() => {
    if (providerRef.current) {
      const auth = getAuth();
      const user = auth.currentUser;
      const name = user?.displayName || user?.email?.split("@")[0] || "Anonymous";
      const photo = user?.photoURL || "";

      providerRef.current.awareness.setLocalStateField("user", {
        name,
        photo,
        color: providerRef.current.awareness.getLocalState()?.user?.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
        focusedId: activeBlockId,
      });
    }
  }, [activeBlockId])





  useEffect(() => {
    if (!command || !activeBlockId) return;

    if (["bold", "italic", "underline"].includes(command.type)) {
      document.execCommand(command.type);
    } else if (command.type === "insertLink") {
      const url = prompt("Enter URL");
      if (url) document.execCommand("createLink", false, url);
    } else if (activeBlockId && yDocRef.current) {
      const yBlocks = yDocRef.current.getArray<Block>("blocks");
      const index = yBlocks.toArray().findIndex((b) => b.id === activeBlockId);
      if (index !== -1) {
        yDocRef.current.transact(() => {
          const block = yBlocks.get(index);
          yBlocks.delete(index);
          yBlocks.insert(index, [{ ...block, type: command.type as BlockType }]);
        });
      }
    }
  }, [command]);

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
                        onDragOver={() => { }}
                        onDrop={handleDrop}
                        isTouch={isTouch}
                      >
                        <EditorBlock
                          block={item}
                          onChange={handleBlockChange}
                          onDelete={deleteBlock}
                          onFocus={(id) => {
                            setActiveBlockId(id);
                            pendingFocusId.current = id;
                          }}
                          onInsertAfter={insertBlockAfter}
                        />
                        {/* Remote user indicators */}
                        {activeUsers
                          .filter((u) => u.focusedId === item.id && u.clientID !== yDocRef.current?.clientID)
                          .map((u) => (
                            <Box
                              key={u.clientID}
                              sx={{
                                position: "absolute",
                                left: -8,
                                top: -14,
                                bgcolor: u.color,
                                color: "white",
                                fontSize: "10px",
                                px: 0.5,
                                borderRadius: 1,
                                zIndex: 1,
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {u.name} is editing...
                            </Box>
                          ))}
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
                    onDragOver={() => { }}
                    onDrop={handleDrop}
                    isTouch={isTouch}
                  >
                    <EditorBlock
                      block={block}
                      onChange={handleBlockChange}
                      onDelete={deleteBlock}
                      onFocus={(id) => {
                        setActiveBlockId(id);
                        pendingFocusId.current = id;
                      }}
                      onInsertAfter={insertBlockAfter}
                    />
                    {/* Remote user indicators */}
                    {activeUsers
                      .filter((u) => u.focusedId === block.id && u.clientID !== yDocRef.current?.clientID)
                      .map((u) => (
                        <Box
                          key={u.clientID}
                          sx={{
                            position: "absolute",
                            left: -8,
                            top: -14,
                            bgcolor: u.color,
                            color: "white",
                            fontSize: "10px",
                            px: 0.5,
                            borderRadius: 1,
                            zIndex: 1,
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.name} is editing...
                        </Box>
                      ))}
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
