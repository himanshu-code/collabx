import mongoose, { Schema, models } from "mongoose";

const BlockSchema = new Schema({
  id: String,
  type: String,
  content: String,
});

const SharedUserSchema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ["viewer", "editor"], required: true },
  },
  { _id: false }
);

const DocumentSchema = new Schema(
  {
    title: { type: String, default: "Untitled Document" },
    ownerId: { type: String, required: true },
    sharedWith: { type: [SharedUserSchema], default: [] },
    blocks: { type: [BlockSchema], default: [] },
    yjsState: { type: Buffer },
  },
  { timestamps: true }
);
// ensure model is not recompiled on hotReloads
export const Document =
  models.Document || mongoose.model("Document", DocumentSchema);
