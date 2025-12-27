import mongoose from 'mongoose';
const FileSchema = new mongoose.Schema({
    name: {type: String, required: true},
    workSpaceId:{type:mongoose.Schema.Types.ObjectId,ref:"Workspace"},
    createdAt: {type: Date, default: Date.now},
});
// ensure mode is not recompiled on hotReloads
export const File = mongoose.models.File || mongoose.model('File', FileSchema);