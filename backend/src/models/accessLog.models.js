import mongoose from "mongoose";

const accessLogSchema = new mongoose.Schema(
  {
    vaultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vault",
      required: true,
    },

    shareLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShareLink",
      required: true,
    },

    outcome: {
      type: String,
      enum: ["ALLOWED", "DENIED"],
      required: true,
    },

    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AccessLog", accessLogSchema);
