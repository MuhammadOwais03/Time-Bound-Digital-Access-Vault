import User from "../models/user.models.js";
import vaultModels from "../models/vault.models.js";
import shareLinkModels from "../models/shareLink.models.js";
import accessLogModels from "../models/accessLog.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateShareToken } from "../utils/token.utils.js";
import bcrypt from "bcrypt";

export const createShareLink = async (req, res) => {
  const { vaultId } = req.params;
  const { expiresInDays, maxViews, password } = req.body;

  console.log(req.body);

  const vault = await vaultModels.findById(vaultId);
  if (!vault) throw new ApiError(404, "Vault not found");

  console.log(
    "Vault Owner:",
    vault.owner.toString(),
    "Requesting User:",
    req.user.userId
  );
  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized");
  }

  const token = generateShareToken();

  // const expiresAt = new Date();
  // expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  let expiresAt = null;
  if (expiresInDays && expiresInDays !== "never") {
    const value = parseInt(expiresInDays); // Get number
    const unit = expiresInDays.replace(value.toString(), ""); // Get unit: h or d

    expiresAt = new Date();

    if (unit === "h") {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else if (unit === "d") {
      expiresAt.setDate(expiresAt.getDate() + value);
    }
    // Add more units if needed (e.g., 'm' for minutes)
  }

  console.log("Expires At:", expiresAt);

  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const shareLink = await shareLinkModels.create({
    vaultId,
    token,
    expiresAt,
    maxViews,
    remainingViews: maxViews,
    passwordHash,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        shareUrl: `${process.env.FRONTEND_URL}/share/${token}`,
        expiresAt,
        maxViews,
      },
      "Share link created"
    )
  );
};

export const accessShareLink = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const link = await shareLinkModels.findOne({ token }).populate("vaultId");

  if (!link)
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Share link not found"));

  if (link.expiresAt < new Date()) {
    link.isLocked = true;
    await link.save();
    await accessLogModels.create({
      vaultId: link.vaultId._id,
      shareLinkId: link._id,
      outcome: "DENIED",
      ipAddress: req.ip,
    });

    return res.status(410).json(new ApiResponse(410, null, "Link expired"));
  }

  if (link.isLocked || link.remainingViews <= 0) {
    await accessLogModels.create({
      vaultId: link.vaultId._id,
      shareLinkId: link._id,
      outcome: "DENIED",
      ipAddress: req.ip,
    });

    return res
      .status(403)
      .json(new ApiResponse(403, null, "Link no longer active"));
  }

  // Password check
  if (link.passwordHash) {
    console.log("Password protected link accessed");
    if (!password) {
      
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Password required"));
    }

    const isValid = await bcrypt.compare(password, link.passwordHash);
    if (!isValid) {
      let outcome = "DENIED";
      await accessLogModels.create({
        vaultId: link.vaultId._id,
        shareLinkId: link._id,
        outcome,
        ipAddress: req.ip,
      });
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid password"));
    }
    
  }

  link.remainingViews -= 1;
  if (link.remainingViews === 0) link.isLocked = true;
  await link.save();

  await accessLogModels.create({
    vaultId: link.vaultId._id,
    shareLinkId: link._id,
    outcome: "ALLOWED",
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vault: link.vaultId,
        remainingViews: link.remainingViews,
      },
      "Access granted"
    )
  );
};

export const getShareLinkAtVaultId = async (req, res) => {
  console.log("Fetching share links for vault:", req.params.vaultId);
  try {
    const shareLinks = await shareLinkModels.find({
      vaultId: req.params.vaultId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, shareLinks, "Share links retrieved successfully")
      );
  } catch (error) {
    console.error(
      "Error fetching share links for vault:",
      req.params.vaultId,
      error
    );
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
};

export const deleteShareLink = async (req, res) => {
  const { id } = req.params; // This is the shareLinkId

  console.log("Deleting share link with ID:", id);

  const link = await shareLinkModels.findById(id);
  if (!link) {
    throw new ApiError(404, "Share link not found");
  }

  const vault = await vaultModels.findById(link.vaultId);
  if (!vault) {
    throw new ApiError(404, "Associated vault not found");
  }

  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized to delete this share link");
  }

  const deleteLogsResult = await accessLogModels.deleteMany({
    shareLinkId: link._id,
  });
  console.log(
    `Deleted ${deleteLogsResult.deletedCount} access logs for share link: ${id}`
  );

  await link.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Share link and its access logs deleted successfully"
      )
    );
};

export const lockShareLink = async (req, res) => {
  const { id } = req.params; // shareLinkId

  const link = await shareLinkModels.findById(id);
  if (!link) throw new ApiError(404, "Share link not found");

  const vault = await vaultModels.findById(link.vaultId);
  if (!vault) throw new ApiError(404, "Associated vault not found");

  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized to modify this share link");
  }

  if (link.isLocked) {
    throw new ApiError(400, "Share link is already locked");
  }

  link.isLocked = true;
  await link.save();

  // Optional: Log manual lock
  await accessLogModels.create({
    vaultId: vault._id,
    shareLinkId: link._id,
    outcome: "DENIED",
    ipAddress: req.ip,
    
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLocked: true }, "Share link locked successfully")
    );
};

export const unlockShareLink = async (req, res) => {
  const { id } = req.params;

  const link = await shareLinkModels.findById(id);
  if (!link) throw new ApiError(404, "Share link not found");

  const vault = await vaultModels.findById(link.vaultId);
  if (!vault) throw new ApiError(404, "Associated vault not found");

  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized to modify this share link");
  }

  if (!link.isLocked) {
    throw new ApiError(400, "Share link is not locked");
  }

  // Optional: Only allow unlock if not expired and views remain
  const now = new Date();
  if (link.expiresAt && link.expiresAt < now) {
    throw new ApiError(400, "Cannot unlock expired share link");
  }
  if (link.remainingViews <= 0) {
    throw new ApiError(400, "Cannot unlock share link with no views remaining");
  }

  link.isLocked = false;
  await link.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLocked: false },
        "Share link unlocked successfully"
      )
    );
};

export const regenerateShareToken = async (req, res) => {
  const { id } = req.params;

  const link = await shareLinkModels.findById(id);
  if (!link) throw new ApiError(404, "Share link not found");

  const vault = await vaultModels.findById(link.vaultId);
  if (!vault) throw new ApiError(404, "Associated vault not found");

  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized to modify this share link");
  }

  const oldToken = link.token;
  const newToken = generateShareToken(); 

  link.token = newToken;
  link.isLocked = false; 
  await link.save();

  const newUrl = `${process.env.FRONTEND_URL}/share/${newToken}`;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        newToken,
        newUrl,
        message: "Token regenerated. Old link is now invalid.",
      },
      "Share link regenerated successfully"
    )
  );
};

export const updateShareLink = async (req, res) => {
  const { id } = req.params;
  const { expiresInDays, maxViews, password } = req.body;

  const link = await shareLinkModels.findById(id);
  if (!link) throw new ApiError(404, "Share link not found");

  const vault = await vaultModels.findById(link.vaultId);
  if (!vault) throw new ApiError(404, "Associated vault not found");

  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized to modify this share link");
  }

  // Update expiresAt
  if (expiresInDays !== undefined) {
    if (expiresInDays === "never" || expiresInDays === null) {
      link.expiresAt = null;
    } else {
      const value = parseInt(expiresInDays);
      const unit = expiresInDays.replace(value.toString(), "");
      const now = new Date();

      if (unit === "h") now.setHours(now.getHours() + value);
      else if (unit === "d") now.setDate(now.getDate() + value);

      link.expiresAt = now;
    }
  }

  
  if (maxViews !== undefined) {
    const newMax = parseInt(maxViews);
    if (isNaN(newMax) || newMax < 1) {
      throw new ApiError(400, "Invalid maxViews value");
    }
    link.maxViews = newMax;
    link.remainingViews = newMax;
    link.isLocked = false; 
  }

  // Update password
  if (password !== undefined) {
    if (password === null || password === "") {
      link.passwordHash = null;
    } else {
      link.passwordHash = await bcrypt.hash(password, 10);
    }
  }

  await link.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        expiresAt: link.expiresAt,
        maxViews: link.maxViews,
        hasPassword: !!link.passwordHash,
      },
      "Share link updated successfully"
    )
  );
};

export const getAccessLogs = async (req, res) => {
  const { vaultId } = req.params;

  const vault = await vaultModels.findById(vaultId);
  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  if (vault.owner.toString() !== req.user.userId) {
    throw new ApiError(403, "Not authorized to view logs for this vault");
  }

  const logs = await accessLogModels
    .find({ vaultId })
    .sort({ createdAt: -1 })
    .lean();

  

  return res
    .status(200)
    .json(new ApiResponse(200, logs, "Access logs retrieved successfully"));
};
