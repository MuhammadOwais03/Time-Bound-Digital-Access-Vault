import React, { useState, useEffect } from 'react';
import { Lock, Share2, CheckCircle, XCircle, Clock, Eye, AlertTriangle, TrendingUp } from 'lucide-react';

const API_BASE_URL = 'https://time-bound-digital-access-vault-s4k.vercel.app/api';

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        <Icon size={24} className={`text-${color}-400`} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-400 text-sm">
          <TrendingUp size={16} />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-purple-300 text-sm font-medium">{title}</p>
    {subtitle && <p className="text-purple-400 text-xs mt-2">{subtitle}</p>}
  </div>
);

const Analytics = ({ showNotification }) => {
  const [analytics, setAnalytics] = useState({
    totalVaults: 0,
    totalShareLinks: 0,
    activeShareLinks: 0,
    expiredShareLinks: 0,
    lockedShareLinks: 0,
    totalAccessLogs: 0,
    allowedAccess: 0,
    deniedAccess: 0,
    viewsRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [vaultsRes, shareLinksRes, accessLogsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vaults/`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/share-links/vaults/:vaultId/share-link`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}share-links/vaults/:vaultId/logs`, { credentials: 'include' })
      ]);

      const vaults = vaultsRes.ok ? await vaultsRes.json() : { data: [] };
      const shareLinks = shareLinksRes.ok ? await shareLinksRes.json() : { data: [] };
      const accessLogs = accessLogsRes.ok ? await accessLogsRes.json() : { data: [] };

      const vaultData = vaults.data || [];
      const shareLinkData = shareLinks.data || [];
      const accessLogData = accessLogs.data || [];

      const now = new Date();
      const activeLinks = shareLinkData.filter(link => 
        new Date(link.expiresAt) > now && !link.isLocked && link.remainingViews > 0
      );
      const expiredLinks = shareLinkData.filter(link => 
        new Date(link.expiresAt) <= now
      );
      const lockedLinks = shareLinkData.filter(link => link.isLocked);

      const allowedLogs = accessLogData.filter(log => log.outcome === 'ALLOWED');
      const deniedLogs = accessLogData.filter(log => log.outcome === 'DENIED');

      const totalViewsRemaining = shareLinkData.reduce((sum, link) => 
        sum + (link.remainingViews || 0), 0
      );

      setAnalytics({
        totalVaults: vaultData.length,
        totalShareLinks: shareLinkData.length,
        activeShareLinks: activeLinks.length,
        expiredShareLinks: expiredLinks.length,
        lockedShareLinks: lockedLinks.length,
        totalAccessLogs: accessLogData.length,
        allowedAccess: allowedLogs.length,
        deniedAccess: deniedLogs.length,
        viewsRemaining: totalViewsRemaining,
      });

      showNotification?.('Analytics updated');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification?.('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const accessRate = analytics.totalAccessLogs > 0 
    ? ((analytics.allowedAccess / analytics.totalAccessLogs) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-purple-300">Overview of your vault security metrics</p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Vaults"
            value={analytics.totalVaults}
            icon={Lock}
            color="purple"
            subtitle="Secure items stored"
          />
          <StatCard
            title="Share Links"
            value={analytics.totalShareLinks}
            icon={Share2}
            color="blue"
            subtitle="Links created"
          />
          <StatCard
            title="Total Access Attempts"
            value={analytics.totalAccessLogs}
            icon={Eye}
            color="indigo"
            subtitle="All time attempts"
          />
          <StatCard
            title="Views Remaining"
            value={analytics.viewsRemaining}
            icon={TrendingUp}
            color="green"
            subtitle="Across all active links"
          />
        </div>

        {/* Share Link Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Share Link Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Active Links"
              value={analytics.activeShareLinks}
              icon={CheckCircle}
              color="green"
              subtitle="Currently accessible"
            />
            <StatCard
              title="Expired Links"
              value={analytics.expiredShareLinks}
              icon={Clock}
              color="orange"
              subtitle="Past expiration date"
            />
            <StatCard
              title="Locked Links"
              value={analytics.lockedShareLinks}
              icon={Lock}
              color="red"
              subtitle="Password protected"
            />
          </div>
        </div>

        {/* Access Logs */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Allowed Access"
              value={analytics.allowedAccess}
              icon={CheckCircle}
              color="green"
              subtitle={`${accessRate}% success rate`}
            />
            <StatCard
              title="Denied Access"
              value={analytics.deniedAccess}
              icon={XCircle}
              color="red"
              subtitle="Unauthorized attempts"
            />
            <StatCard
              title="Security Score"
              value={`${accessRate}%`}
              icon={AlertTriangle}
              color={accessRate >= 80 ? 'green' : accessRate >= 50 ? 'yellow' : 'red'}
              subtitle="Access success rate"
            />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
          >
            Refresh Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;