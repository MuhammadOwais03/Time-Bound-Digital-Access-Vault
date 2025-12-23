import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema(
  {
    vaultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vault",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    maxViews: {
      type: Number,
      required: true,
      min: 1,
    },

    remainingViews: {
      type: Number,
      required: true,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShareLink", shareLinkSchema);
