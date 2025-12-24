

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Plus,
  ChevronRight,
  RefreshCw,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BarChart3,
} from "lucide-react";

const API_BASE_URL = "https://time-bound-digital-access-vault-s4k.vercel.app/api";
// const API_BASE_URL = "http://localhost:3000/api";
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        <Icon size={20} className={`text-${color}-400`} />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-purple-300 text-sm font-medium">{title}</p>
    {subtitle && <p className="text-purple-400 text-xs mt-1">{subtitle}</p>}
  </div>
);

const Dashboard = ({ showNotification }) => {
  const navigate = useNavigate();
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalVaults: 0,
    totalShareLinks: 0,
    activeShareLinks: 0,
    expiredShareLinks: 0,
    allowedAccess: 0,
    deniedAccess: 0,
  });

  const fetchVaultItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vaults/`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setVaultItems(data.data || []);
      } else if (response.status === 401) {
        showNotification("Session expired. Please log in again.", "error");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching vault items:", error);
      showNotification("Failed to load vault items", "error");
    } finally {
      setLoading(false);
    }
  };

  // const fetchAnalytics = async () => {
  //   try {
  //     const [shareLinksRes, accessLogsRes] = await Promise.all([
  //      fetch(`${API_BASE_URL}/share-links/vaults/:vaultId/share-link`, { credentials: 'include' }),
  //       fetch(`${API_BASE_URL}share-links/vaults/:vaultId/logs`, { credentials: 'include' })
  //     ]);

  //     const shareLinks = shareLinksRes.ok ? await shareLinksRes.json() : { data: [] };
  //     const accessLogs = accessLogsRes.ok ? await accessLogsRes.json() : { data: [] };

  //     const shareLinkData = shareLinks.data || [];
  //     const accessLogData = accessLogs.data || [];

  //     const now = new Date();
  //     const activeLinks = shareLinkData.filter(link =>
  //       new Date(link.expiresAt) > now && !link.isLocked && link.remainingViews > 0
  //     );
  //     const expiredLinks = shareLinkData.filter(link =>
  //       new Date(link.expiresAt) <= now
  //     );

  //     const allowedLogs = accessLogData.filter(log => log.outcome === 'ALLOWED');
  //     const deniedLogs = accessLogData.filter(log => log.outcome === 'DENIED');

  //     setAnalytics({
  //       totalVaults: vaultItems.length,
  //       totalShareLinks: shareLinkData.length,
  //       activeShareLinks: activeLinks.length,
  //       expiredShareLinks: expiredLinks.length,
  //       allowedAccess: allowedLogs.length,
  //       deniedAccess: deniedLogs.length,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching analytics:', error);
  //   }
  // };
  const fetchAnalytics = async () => {
    if (vaultItems.length === 0) {
      setAnalytics({
        totalVaults: 0,
        totalShareLinks: 0,
        activeShareLinks: 0,
        inactiveShareLinks: 0,
        totalAccessAttempts: 0,
        allowedAccess: 0,
        deniedAccess: 0,
        successRate: 0,
      });
      return;
    }

    try {
      // Fetch share links and logs for ALL vaults in parallel
      const shareLinksPromises = vaultItems.map((vault) =>
        fetch(`${API_BASE_URL}/share-links/vaults/${vault._id}/share-link`, {
          credentials: "include",
        }).then((res) => (res.ok ? res.json() : { data: [] }))
      );

      const accessLogsPromises = vaultItems.map((vault) =>
        fetch(`${API_BASE_URL}/share-links/vaults/${vault._id}/logs`, {
          credentials: "include",
        }).then((res) => (res.ok ? res.json() : { data: [] }))
      );

      const [shareLinksResults, accessLogsResults] = await Promise.all([
        Promise.all(shareLinksPromises),
        Promise.all(accessLogsPromises),
      ]);

      // Flatten all share links and logs
      const allShareLinks = shareLinksResults.flatMap(
        (result) => result.data || []
      );
      const allAccessLogs = accessLogsResults.flatMap(
        (result) => result.data || []
      );

      console.log("All Share Links:", allShareLinks);

      const now = new Date();

      // Active share links
      const activeShareLinks = allShareLinks.filter(
        (link) =>
          (!link.expiresAt || new Date(link.expiresAt) > now) &&
          !link.isLocked &&
          link.remainingViews > 0
      );

      // Inactive (expired, locked, or exhausted)
      const inactiveShareLinks = allShareLinks.length - activeShareLinks.length;
      console.log("Active Share Links:", activeShareLinks);
      console.log("Inactive Share Links:", inactiveShareLinks);

      // Access outcomes
      const allowedAccess = allAccessLogs.filter(
        (log) => log.outcome === "ALLOWED"
      ).length;
      const deniedAccess = allAccessLogs.filter(
        (log) => log.outcome === "DENIED"
      ).length;
      const totalAccessAttempts = allowedAccess + deniedAccess;
      const successRate =
        totalAccessAttempts > 0
          ? Math.round((allowedAccess / totalAccessAttempts) * 100)
          : 0;

      setAnalytics({
        totalVaults: vaultItems.length,
        totalShareLinks: allShareLinks.length,
        activeShareLinks: activeShareLinks.length,
        inactiveShareLinks,
        totalAccessAttempts,
        allowedAccess,
        deniedAccess,
        successRate,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showNotification("Failed to load analytics", "error");
    }
  };
  useEffect(() => {
    fetchVaultItems();
  }, []);

  useEffect(() => {
    if (vaultItems.length > 0) {
      fetchAnalytics();
    }
  }, [vaultItems]);

  useEffect(() => {
    console.log("Vault items updated:", vaultItems);
  }, [vaultItems]);

  const handleRefresh = () => {
    fetchVaultItems();
    showNotification("Refreshed vault items");
  };

  useEffect(() => {
    console.log("Analytics updated:", analytics);
  }, [analytics]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Lock size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Vault</h1>
              <p className="text-purple-300">Manage your secure items</p>
            </div>
          </div>
          <div className="flex gap-2">

          <button
            onClick={() => navigate("/create")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg  flex items-center justify-center gap-2 font-semibold transition-colors"
          >
            <Plus size={20} />
            Create New Vault Item
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={24} className="text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Analytics Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Vaults"
              value={analytics.totalVaults}
              icon={Lock}
              color="purple"
            />
            <StatCard
              title="Share Links"
              value={analytics.totalShareLinks}
              icon={Share2}
              color="blue"
            />
            <StatCard
              title="Active Links"
              value={analytics.activeShareLinks}
              icon={CheckCircle}
              color="green"
              subtitle="Currently accessible"
            />
            <StatCard
              title="Expired"
              value={analytics.inactiveShareLinks}
              icon={Clock}
              color="orange"
            />
            <StatCard
              title="Allowed"
              value={analytics.allowedAccess}
              icon={CheckCircle}
              color="green"
              subtitle="Access granted"
            />
            <StatCard
              title="Denied"
              value={analytics.deniedAccess}
              icon={XCircle}
              color="red"
              subtitle="Access blocked"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-purple-300 mt-4">Loading your vault...</p>
            </div>
          ) : vaultItems.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
              <Lock size={48} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No vault items yet
              </h3>
              <p className="text-purple-300">
                Create your first secure vault item to get started
              </p>
            </div>
          ) : (
            vaultItems.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/vault/${item._id}`)}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {item.title || "Untitled"}
                    </h3>
                    {/* <p className="text-purple-300 text-sm mb-3 line-clamp-2">
                      {(item.content || "").substring(0, 100)}...
                    </p> */}
                    <div className="flex gap-4 text-sm">
                      <span className="text-purple-400">
                        Created:{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                      {(item.shareCount || 0) > 0 && (
                        <span className="text-green-400">
                          {item.shareCount} share link
                          {item.shareCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className="text-purple-400 group-hover:text-white transition-colors"
                    size={24}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
