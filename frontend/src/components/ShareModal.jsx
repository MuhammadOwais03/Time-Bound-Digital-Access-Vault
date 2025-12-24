import React, { useState, useEffect } from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

const API_BASE_URL = "https://time-bound-digital-access-vault-s4k.vercel.app/api";

const ShareModal = ({ vaultId, onClose, onCreated, showNotification }) => {
  const [expiresInDays, setExpiresInDays] = useState("24h");
  const [maxViews, setMaxViews] = useState("");
  const [password, setPassword] = useState("");
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
      console.log(`Creating share link for vault ${vaultId}`);
      const response = await fetch(
        `${API_BASE_URL}/share-links/vaults/${vaultId}/share`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (response.ok) {
        onCreated();
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
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
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
                  className="w-full px-4 py-3 pr-12 bg-black/50 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
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

export default ShareModal;
