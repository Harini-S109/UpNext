const mongoose = require('mongoose');

// Schema for Files
const fileSchema = new mongoose.Schema({
    fileName: { type: String, required: true }, // Unique index automatically created
    originalName: { type: String },
    filePath: { type: String, required: true },
    fileType: { type: String },
    fileSize: { type: Number },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});


// Schema for Folders
const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
fileSchema.index({ folderId: 1, originalName: 1 });
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ fileName: 1 });

folderSchema.index({ parentFolder: 1 });
folderSchema.index({ path: 1 });
folderSchema.index({ createdBy: 1 });

const File = mongoose.model('File', fileSchema);
const Folder = mongoose.model('Folder', folderSchema);

module.exports = { File, Folder };