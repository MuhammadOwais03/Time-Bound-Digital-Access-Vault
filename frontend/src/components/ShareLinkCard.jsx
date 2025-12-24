


import React, { useEffect, useState, useRef } from "react";
import {
  Shield,
  Lock,
  Unlock,
  Copy,
  Trash2,
  RefreshCw,
  Edit3,
  Eye,
  EyeOff,
  AlertCircle,
  MoreVertical,
} from "lucide-react";


const API_BASE_URL = "https://time-bound-digital-access-vault-s4k.vercel.app";

const EditShareModal = ({ share, onClose, onUpdated, showNotification }) => {
  const [expiresInDays, setExpiresInDays] = useState(share.expiresAt ? Math.ceil((new Date(share.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) + "d" : "never");
  const [maxViews, setMaxViews] = useState(share.maxViews || "");
  const [password, setPassword] = useState(share.passwordHash);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      const body = {
        expiresInDays: expiresInDays === "never" ? null : expiresInDays,
        maxViews: maxViews ? parseInt(maxViews, 10) : null,
        password: password || null,
      };
      console.log(`${API_BASE_URL}/api/share-links/shares/${share._id}/update`, body);
      const response = await fetch(
        `${API_BASE_URL}/api/share-links/shares/${share._id}/update`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      console.log("Update response:", response);

      const data = await response.json();
      console.log("Update response data:", data);

      if (data) {
        share.expiresAt = data.data.expiresAt;
        share.maxViews = data.data.maxViews;
        share.passwordHash = data.data.hasPassword;
        share.remainingViews = data.data.maxViews;
      }

      if (response.ok) {
        onUpdated();
      } else {
        setError(data.message || "Failed to create share link");
      }
    } catch (err) {
      console.error("Failed to create share link:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">
          Create Share Link
        </h2>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-purple-200 mb-2 font-medium">
                Expires in
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full px-4 py-3  bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              >
                <option value="1h">1 hour</option>
                <option value="6h">6 hours</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div>
              <label className="block text-purple-200 mb-2 font-medium">
                Max views
              </label>
              <select
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              >
                <option value="">Unlimited</option>
                <option value="1">1 time</option>
                <option value="5">5 times</option>
                <option value="10">10 times</option>
                <option value="25">25 times</option>
                <option value="50">50 times</option>
                <option value="100">100 times</option>
              </select>
            </div>

            <div>
              <label className="block text-purple-200 mb-2 font-medium">
                Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for no password"
                  className="w-full px-4 py-3 pr-12  bg-black/50 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              <p className="text-purple-400 text-xs mt-2">
                Add an extra layer of security with a password
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200"
            >
              {loading ? "Creating..." : "Create Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareLinkCard = ({ share, showNotification, onRevoke, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(share.isLocked);
  const [loadingAction, setLoadingAction] = useState(null);
  const [currentToken, setCurrentToken] = useState(share.token);
  const [fullUrl, setFullUrl] = useState(`https://time-bound-digital-access-vault-nine.vercel.app/share/`);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  if (!share) return null;

  const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();
  const isExhausted = share.remainingViews === 0;

  useEffect(() => {
    console.log(share);
  }, []);

  useEffect(() => {
    console.log("Full URL updated:", fullUrl, share.token);
  }, [fullUrl]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl + currentToken);
      showNotification("Share link copied!", "success");
    } catch {
      showNotification("Failed to copy", "error");
    }
  };

  const handleLockToggle = async () => {
    console.log("Toggling lock status...");
    setShowDropdown(false);
    setLoadingAction("lock");
    try {
      const endpoint = share.isLocked
        ? `/api/share-links/shares/${share._id}/unlock`
        : `/api/share-links/shares/${share._id}/lock`;
      console.log(
        "API endpoint:",
        endpoint,
        share,
        `${API_BASE_URL}${endpoint}`
      );
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setIsLocked(!isLocked);
        share.isLocked = !isLocked;
        showNotification(
          isLocked
            ? "Share link unlocked successfully"
            : "Share link locked successfully",
          "success"
        );
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to update lock status");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to update lock status", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRegenerate = async () => {
    setShowDropdown(false);
    setLoadingAction("regenerate");
    try {
      console.log(`${API_BASE_URL}/api/share-links/shares/${share._id}/regenerate`);
      const res = await fetch(
        `${API_BASE_URL}/api/share-links/shares/${share._id}/regenerate`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("Regenerate response data:", data);
      setCurrentToken(data.data.newToken);

      if (res.ok) {
        showNotification(
          "Token regenerated! Old link is now invalid.",
          "success"
        );
      } else {
        throw new Error(data.message || "Failed to regenerate token");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to regenerate token", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    setLoadingAction("delete");
    try {
      const res = await fetch(`${API_BASE_URL}/api/share-links/${share._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        showNotification("Share link deleted successfully", "success");
        onDelete(share._id);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete share link");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete share link", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={`bg-white/5 rounded-lg p-5 border transition-all ${
        isExpired || isExhausted || isLocked
          ? "border-red-500/50"
          : "border-white/10"
      } backdrop-blur`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Status Icons */}
          <div className="flex items-center gap-3 mb-3">
            {share.passwordHash ? (
              <Lock size={18} className="text-yellow-400" />
            ) : (
              <Shield size={18} className="text-green-400" />
            )}
            {isLocked && (
              <Lock
                size={18}
                className="text-red-400"
                title="Locked by owner"
              />
            )}
            {(isExpired || isExhausted) && (
              <AlertCircle size={18} className="text-red-400" />
            )}
            <span className="text-sm text-purple-300">
              {share.passwordHash ? "Password Protected" : "Open Access"}
            </span>
          </div>

          {/* Share URL */}
          <p className="text-white font-mono text-sm break-all mb-3">
            {fullUrl + currentToken}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-purple-400">Expires:</span>
              <span className="text-white ml-2">
                {share.expiresAt
                  ? new Date(share.expiresAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
            <div>
              <span className="text-purple-400">Views:</span>
              <span
                className={`ml-2 ${
                  isExhausted ? "text-red-400" : "text-white"
                }`}
              >
                {share.remainingViews ?? "∞"} / {share.maxViews || "∞"}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {(isExpired || isExhausted || isLocked) && (
            <div className="text-red-400 text-sm font-medium">
              {isExpired && "⏰ Expired"}
              {isExhausted && "🔒 View limit reached"}
              {isLocked && "🔒 Manually locked"}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-start gap-2">
          {/* Copy Button - Keep this outside dropdown */}
          <button
            onClick={copyToClipboard}
            className="p-2.5 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
            title="Copy link"
          >
            <Copy size={18} className="text-purple-300" />
          </button>

          {/* Three Dot Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical size={18} className="text-white" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-white/20 shadow-xl z-10 overflow-hidden">
                {/* Lock / Unlock */}
                <button
                  onClick={handleLockToggle}
                  disabled={loadingAction === "lock"}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  {loadingAction === "lock" ? (
                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  ) : isLocked ? (
                    <Unlock size={18} className="text-orange-400" />
                  ) : (
                    <Lock size={18} className="text-orange-400" />
                  )}
                  <span>{isLocked ? "Unlock Link" : "Lock Link"}</span>
                </button>

                {/* Regenerate */}
                <button
                  onClick={handleRegenerate}
                  disabled={loadingAction === "regenerate"}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  {loadingAction === "regenerate" ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw size={18} className="text-blue-400" />
                  )}
                  <span>Regenerate Token</span>
                </button>

                {/* Edit */}
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Edit3 size={18} className="text-cyan-400" />
                  <span>Edit Settings</span>
                </button>

                {/* Divider */}
                <div className="border-t border-white/10"></div>

                {/* Delete */}
                <button
                  onClick={handleDelete}
                  disabled={loadingAction === "delete"}
                  className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-600/20 transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  {loadingAction === "delete" ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={18} className="text-red-400" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditShareModal
          share={share}
          onClose={() => setIsEditing(false)}
          onUpdated={() => {
            setIsEditing(false);
          }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default ShareLinkCard;