import { config } from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import mongoose from "mongoose";
import { Document } from "../models/Document";

// Load environment variables from .env.local
config({ path: ".env.local" });

interface WSSharedDoc {
    name: string;              // Document ID
    doc: Y.Doc;                // The Yjs CRDT document
    conns: Map<WebSocket, Set<number>>;  // Connected clients
    awareness: awarenessProtocol.Awareness;            // Who's online, cursor positions
}


mongoose.connect(process.env.MONGODB_URI || "");

const port = Number(process.env.PORT) || 3001;
const wss = new WebSocketServer({ port });
console.log(`WebSocketServer Running on port ${port}`);

const docs = new Map<string, WSSharedDoc>();
const initializingDocs = new Map<string, Promise<WSSharedDoc>>();

async function getYdoc(docname: string): Promise<WSSharedDoc> {
    let doc = docs.get(docname);
    if (doc) return doc;

    let initPromise = initializingDocs.get(docname);
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const ydoc = new Y.Doc();
        const awareness = new awarenessProtocol.Awareness(ydoc);
        const newDoc: WSSharedDoc = {
            name: docname,
            doc: ydoc,
            conns: new Map(),
            awareness: awareness,
        };

        // Load document from MongoDB ONLY ONCE upon creation in memory
        await loadFromMongo(docname, ydoc);

        docs.set(docname, newDoc);

        let saveTimeOut: NodeJS.Timeout;
        ydoc.on("update", (update, origin) => {
            // Broadcast the update to all other connected clients
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 0); // messageSync
            syncProtocol.writeUpdate(encoder, update);
            const message = encoding.toUint8Array(encoder);
            newDoc.conns.forEach((_, client) => {
                if (client !== origin && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });

            clearTimeout(saveTimeOut);
            saveTimeOut = setTimeout(() => {
                saveToMongo(docname, ydoc);
            }, 2000);
        });

        awareness.on("update", ({ added, updated, removed }: any, origin: any) => {
            const changedClients = added.concat(updated).concat(removed);
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 1); // messageAwareness
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
            const message = encoding.toUint8Array(encoder);
            newDoc.conns.forEach((_, client) => {
                if (client !== origin && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        initializingDocs.delete(docname);
        return newDoc;
    })();

    initializingDocs.set(docname, initPromise);
    return initPromise;
}

async function loadFromMongo(docId: string, ydoc: Y.Doc) {
    try {
        const doc = await Document.findById(docId);
        if (!doc) return;

        if (doc.yjsState) {
            // Apply preserved Yjs state to avoid re-creating operations (prevents duplication)
            Y.applyUpdate(ydoc, new Uint8Array(doc.yjsState));
            console.log(`Loaded Document ${docId} from yjsState metadata`);
        } else if (doc.blocks && doc.blocks.length > 0) {
            // Fallback for documents that only have the blocks array (initial load)
            const Yblocks = ydoc.getArray("blocks");
            ydoc.transact(() => {
                const plainBlocks = JSON.parse(JSON.stringify(doc.blocks));
                const cleanedBlocks = plainBlocks.map((b: any) => {
                    delete b._id;
                    return b;
                });
                Yblocks.push(cleanedBlocks);
            });
            console.log(`Loaded Document ${docId} from blocks array fallback`);
        }
    }
    catch (error) {
        console.error(`Error loading document from mongo`, error);
    }
}

async function saveToMongo(docId: string, ydoc: Y.Doc) {
    try {
        const yBlocks = ydoc.getArray("blocks");
        const blocks = yBlocks.toArray().map((b: any) => {
            const { _id, ...rest } = b;
            return rest;
        });

        // Save both the readable blocks and the binary Yjs state
        const yjsState = Buffer.from(Y.encodeStateAsUpdate(ydoc));
        await Document.findByIdAndUpdate(docId, { blocks, yjsState });
        console.log(`Saved Document ${docId} to mongoDB (with Yjs state)`);
    }
    catch (error) {
        console.error(`Error saving document to mongo`, error);
    }
}


wss.on("connection", async (conn, req) => {
    const docName = req.url?.slice(1) || "default";
    console.log(`Client connected successfully to document ${docName}`);
    const sharedDoc = await getYdoc(docName);
    sharedDoc.conns.set(conn, new Set());

    // Send initial sync state
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0);
    syncProtocol.writeSyncStep1(encoder, sharedDoc.doc);
    conn.send(encoding.toUint8Array(encoder));

    conn.on("message", (message: Buffer) => {
        const decoder = decoding.createDecoder(new Uint8Array(message));
        const messageType = decoding.readVarUint(decoder);

        if (messageType === 0) {
            const responseEncoder = encoding.createEncoder();
            encoding.writeVarUint(responseEncoder, 0);
            // Pass conn as origin so it doesn't get the update back
            syncProtocol.readSyncMessage(decoder, responseEncoder, sharedDoc.doc, conn);

            if (encoding.length(responseEncoder) > 1) {
                conn.send(encoding.toUint8Array(responseEncoder));
            }
        } else if (messageType === 1) {
            awarenessProtocol.applyAwarenessUpdate(sharedDoc.awareness, decoding.readVarUint8Array(decoder), conn);
        }
    });

    conn.on("close", () => {
        sharedDoc.conns.delete(conn);
        console.log(`Client disconnected from document ${docName}`);
    });

    conn.on("error", (error) => {
        console.error(`WebSocket error for document ${docName}:`, error);
    });
});
