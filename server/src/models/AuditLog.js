import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    actorId: { type: Number, default: null, index: true },
    action: { type: String, required: true, maxlength: 80 },
    details: { type: String, required: true, maxlength: 500 },
    ipAddress: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
