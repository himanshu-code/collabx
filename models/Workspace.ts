import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({
    name: {type: String, required: true},
    ownerId:{type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});
// ensure mode is not recompiled on hotReloads
export const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);