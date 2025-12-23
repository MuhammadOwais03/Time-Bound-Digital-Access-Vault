import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Share2,
  Clock,
  AlertCircle,
  Shield,
  Lock,
  Copy,
  Trash2,
} from "lucide-react";
import ShareModal from "./ShareModal";
import ShareLinkCard from "./ShareLinkCard";

const API_BASE_URL = "http://localhost:3000/api";




const ViewVault = ({ showNotification }) => {
  const navigate = useNavigate();
  const { vaultId } = useParams();
  const [vault, setVault] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLinks, setShareLinks] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [showFullToken, setShowFullToken] = useState(false);

  const fetchVault = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vaults/${vaultId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setVault(data.data);
      } else {
        if (showNotification) {
          showNotification("Vault not found", "error");
        }
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to load vault:", err);
      if (showNotification) {
        showNotification("Failed to load vault", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShareLinks = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/share-links/vaults/${vaultId}/share-link`,
        {
          credentials: "include",
        }
      );
      console.log("Fetch share links response:", response);
      if (response.ok) {
        const data = await response.json();
        console.log("Share links data:", data);
        setShareLinks(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Failed to fetch share links:", response.statusText);
        setShareLinks([]);
      }
    } catch (error) {
      console.error("Error fetching share links:", error);
      setShareLinks([]);
    }
  };

  const fetchAccessLogs = async () => {
    console.log("Fetching access logs for vault:", vaultId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/share-links/vaults/${vaultId}/logs`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Access logs data:", data);
        setAccessLogs(Array.isArray(data.data) ? data.data : []);
      } else {
        setAccessLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setAccessLogs([]);
    }
  };

  useEffect(() => {
    if (vaultId) {
      fetchVault();
      fetchShareLinks();
      fetchAccessLogs();
    }
  }, [vaultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-300">Loading vault...</div>
      </div>
    );
  }

  if (!vault) return null;

  const handleDeleteShareLink = (shareLinkId) => {
  // Remove from local state
  setShareLinks(prev => prev.filter(link => link._id !== shareLinkId));
  // Or refetch from server
  // fetchShareLinks();
};

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-purple-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {vault.title || "Untitled"}
              </h1>
              <p className="text-purple-300">
                Created:{" "}
                {vault.createdAt
                  ? new Date(vault.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Share2 size={18} />
              Create Share Link
            </button>
          </div>

          <div className="flex gap-2 mb-6 border-b border-white/20">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "content"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("shares")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "shares"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Share Links ({shareLinks.length})
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === "logs"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Access Logs ({accessLogs.length})
            </button>
          </div>

          {activeTab === "content" && (
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              {showContent ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-300 font-semibold">
                      Sensitive Content:
                    </span>
                    <button
                      onClick={() => setShowContent(false)}
                      className="text-purple-400 hover:text-white flex items-center gap-1"
                    >
                      <EyeOff size={18} />
                      Hide
                    </button>
                  </div>
                  <div className="bg-black/30 rounded p-4 text-white font-mono text-sm whitespace-pre-wrap break-all">
                    {vault.content}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowContent(true)}
                  className="w-full py-8 flex flex-col items-center gap-3 text-purple-300 hover:text-white transition-colors"
                >
                  <Eye size={32} />
                  <span className="font-semibold">
                    Click to reveal sensitive content
                  </span>
                </button>
              )}
            </div>
          )}

          {activeTab === "shares" && (
            <div className="space-y-4">
              {shareLinks.length === 0 ? (
                <div className="text-center py-12 text-purple-300">
                  No share links created yet
                </div>
              ) : (
                shareLinks.map((share) => (
                  <ShareLinkCard
                    key={share._id || Math.random()}
                    share={share}
                    showNotification={showNotification}
                    onDelete={handleDeleteShareLink}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-3">
              {accessLogs.length === 0 ? (
                <div className="text-center py-12 text-purple-300">
                  <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">No access attempts logged yet</p>
                  <p className="text-sm mt-1 opacity-70">
                    Share links will be tracked here when accessed
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Access History
                    </h3>
                    <div className="flex gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-purple-300">
                          {
                            accessLogs.filter((l) => l.outcome === "ALLOWED")
                              .length
                          }{" "}
                          Allowed
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-purple-300">
                          {
                            accessLogs.filter((l) => l.outcome === "DENIED")
                              .length
                          }{" "}
                          Denied
                        </span>
                      </div>
                    </div>
                  </div>

                  {accessLogs.map((log, idx) => (
                    // <div
                    //   key={log._id || idx}
                    //   className={`bg-white/5 rounded-lg p-5 border transition-all hover:bg-white/10 ${
                    //     log.outcome === "ALLOWED"
                    //       ? "border-green-500/30"
                    //       : "border-red-500/30"
                    //   }`}
                    // >
                    //   <div className="flex items-start justify-between gap-4">
                    //     <div className="flex-1">
                    //       {/* Status Badge */}
                    //       <div className="flex items-center gap-2 mb-3">
                    //         <span
                    //           className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    //             log.outcome === "ALLOWED"
                    //               ? "bg-green-500/20 text-green-400"
                    //               : "bg-red-500/20 text-red-400"
                    //           }`}
                    //         >
                    //           {log.outcome === "ALLOWED" ? "✓" : "✕"}
                    //           {log.outcome}
                    //         </span>
                    //         <span className="text-purple-300 text-sm">
                    //           <Clock size={14} className="inline mr-1" />
                    //           {log.createdAt
                    //             ? new Date(log.createdAt).toLocaleString("en-US", {
                    //                 dateStyle: "medium",
                    //                 timeStyle: "short",
                    //               })
                    //             : "Unknown time"}
                    //         </span>
                    //       </div>

                    //       {/* Details Grid */}
                    //       <div className="grid grid-cols-2 gap-3 text-sm">
                    //         <div>
                    //           <span className="text-purple-400 font-medium">IP Address:</span>
                    //           <span className="text-white ml-2 font-mono">
                    //             {log.ipAddress || "Unknown"}
                    //           </span>
                    //         </div>
                    //         <div>
                    //           <span className="text-purple-400 font-medium">Share Link ID:</span>
                    //           <span className="text-white ml-2 font-mono text-xs">
                    //             {log.shareLinkId
                    //               ? `...${log.shareLinkId.slice(-8)}`
                    //               : "N/A"}
                    //           </span>
                    //         </div>
                    //       </div>

                    //       {/* Additional Info for Denied Access */}
                    //       {log.outcome === "DENIED" && (
                    //         <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/20">
                    //           <p className="text-red-300 text-xs">
                    //             <AlertCircle size={12} className="inline mr-1" />
                    //             Access was denied - possible reasons: expired link, view limit reached, or incorrect password
                    //           </p>
                    //         </div>
                    //       )}
                    //     </div>

                    //     {/* Quick Actions */}
                    //     <div className="flex flex-col items-end gap-1 text-xs text-purple-400">
                    //       <span className="opacity-70">
                    //         {log.createdAt
                    //           ? new Intl.RelativeTimeFormat("en", {
                    //               style: "narrow",
                    //             }).format(
                    //               Math.round(
                    //                 (new Date(log.createdAt) - new Date()) /
                    //                   (1000 * 60 * 60 * 24)
                    //               ),
                    //               "day"
                    //             )
                    //           : ""}
                    //       </span>
                    //     </div>
                    //   </div>
                    // </div>
                    <div
                      key={log._id || idx}
                      className={`bg-white/5 rounded-lg p-5 border transition-all hover:bg-white/10 ${
                        log.outcome === "ALLOWED"
                          ? "border-green-500/30"
                          : "border-red-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Status Badge + Timestamp */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                log.outcome === "ALLOWED"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {log.outcome === "ALLOWED" ? "✓" : "✕"}
                              {log.outcome}
                            </span>
                            <span className="text-purple-300 text-sm">
                              <Clock size={14} className="inline mr-1" />
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleString(
                                    "en-US",
                                    {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    }
                                  )
                                : "Unknown time"}
                            </span>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* IP Address */}
                            <div>
                              <span className="text-purple-400 font-medium">
                                IP Address:
                              </span>
                              <span className="text-white ml-2 font-mono">
                                {log.ipAddress || "Unknown"}
                              </span>
                            </div>

                            {/* Share Link Token - Click to Reveal Full */}
                            <div>
                              <span className="text-purple-400 font-medium">
                                Share Link:
                              </span>
                              <div className="text-white ml-2 font-mono text-xs break-all mt-1">
                                {log.shareLinkId ? (
                                  <button
                                    onClick={() =>
                                      setShowFullToken(!showFullToken)
                                    }
                                    className="text-purple-300 hover:text-purple-100 underline transition-colors"
                                    title="Click to show/hide full token"
                                  >
                                    {showFullToken
                                      ? "http://localhost:5173/share/"+log.shareLinkId
                                      : `...${log.shareLinkId.slice(-12)}`}
                                  </button>
                                ) : (
                                  <span className="text-purple-400">N/A</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Denied Access Warning */}
                          {log.outcome === "DENIED" && (
                            <div className="mt-4 p-3 bg-red-500/10 rounded border border-red-500/20">
                              <p className="text-red-300 text-sm flex items-center gap-2">
                                <AlertCircle size={16} className="inline" />
                                Access denied — possible reasons: expired link,
                                max views reached, or wrong password
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Relative Time */}
                        <div className="text-right text-xs text-purple-400 opacity-70">
                          {log.createdAt &&
                            new Intl.RelativeTimeFormat("en", {
                              style: "narrow",
                            }).format(
                              Math.round(
                                (new Date(log.createdAt) - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              ),
                              "day"
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          vaultId={vault._id}
          onClose={() => setShowShareModal(false)}
          onCreated={() => {
            fetchShareLinks();
            if (showNotification) {
              showNotification("Share link created successfully!", "success");
            }
            setShowShareModal(false);
          }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default ViewVault;
