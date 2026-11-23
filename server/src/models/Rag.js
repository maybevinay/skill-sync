import mongoose from "mongoose";

const ragChunkSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    documentId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

const ragDocumentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    filename: { type: String, required: true },
    contentType: { type: String, default: "text/plain" },
    status: {
      type: String,
      enum: ["PROCESSING", "PROCESSED", "FAILED"],
      default: "PROCESSING",
      index: true,
    },
    chunkCount: { type: Number, default: 0 },
    fileSizeBytes: { type: Number, default: 0 },
    errorMessage: { type: String, default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const RagDocument = mongoose.model("RagDocument", ragDocumentSchema);
export const RagChunk = mongoose.model("RagChunk", ragChunkSchema);
