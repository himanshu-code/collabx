import mongoose, { Schema, models } from "mongoose";

const BlockSchema = new Schema({
  id: String,
  type: String,
  content: String,
});

const DocumentSchema = new Schema(
  {
    title: { type: String, default: "Untitled Document" },
    ownerId: { type: String, required: true },
    blocks: { type: [BlockSchema], default: [] },
  },
  { timestamps: true }
);
// ensure model is not recompiled on hotReloads
export const Document =
  models.Document || mongoose.model("Document", DocumentSchema);
