import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Key, AlertCircle } from 'lucide-react';
import { useRef } from 'react';


const API_BASE_URL = 'https://time-bound-digital-access-vault-s4k.vercel.app/api';

const PublicAccess = () => {
  const { shareId } = useParams(); 
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const hasCalled = useRef(false);

  const attemptAccess = async (pwd = '') => {
    setLoading(true);
    setError('');
    console.log(`${API_BASE_URL}/share-links/share/${shareId} - Attempting access with password:`, pwd ? '***' : '(none)');
    // http://localhost:3000/api/share-links/share/ddd1ad396fb02565ff641baf7a258b6c7dcf89154cc5534b35a17ffe5744c1ba
    // http://localhost:3000/api/share-links/share/21b045f70b7ff4aaa673d5ee9bdb4305c62a5264b72f25b4c3b6418c927c7a7e
    try {
      const response = await fetch(`${API_BASE_URL}/share-links/share/${shareId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await response.json();
      console.log('Access response:', data);

      if (response.ok) {

        setContent(data.data);
        setNeedsPassword(false);
      } else if (response.status === 401 && data.message.includes('Password')) {
        setNeedsPassword(true);
        setError(data.message);
      } else {
        setError(data.message || 'Access denied');
      }
    } catch (err) {
      console.error('Access error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  if (hasCalled.current) return;
  hasCalled.current = true;

  console.log('Share ID:', shareId);
  attemptAccess();
}, [shareId]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    attemptAccess(password);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-300 text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">

          {/* Success: Content Revealed */}
          {content && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-500 p-3 rounded-full">
                  <Key size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{content.title}</h1>
                  <p className="text-green-400">Access Granted</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-green-500/30 mb-6">
                <p className="text-purple-200 font-semibold mb-3">Title:</p>
                <div className=" rounded p-5 text-white font-mono text-sm whitespace-pre-wrap break-all">
                  {content.vault.title}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-green-500/30 mb-6">
                <p className="text-purple-200 font-semibold mb-3">Secure Content:</p>
                <div className=" rounded p-5 text-white font-mono text-sm whitespace-pre-wrap break-all">
                  {content.vault.content}
                </div>
              </div>

              

              {content.remainingViews !== undefined && (
                <p className="text-yellow-400 text-sm mb-4">
                  {content.remainingViews > 0 
                    ? `${content.remainingViews} view${content.remainingViews !== 1 ? 's' : ''} remaining`
                    : 'This was the last allowed view'
                  }
                </p>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200">
                <strong>⚠️ Security Notice:</strong> This content is sensitive. Do not screenshot, share, or store it insecurely.
              </div>
            </div>
          )}

          {/* Password Required */}
          {needsPassword && !content && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500 p-3 rounded-full">
                  <Lock size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Password Required</h1>
                  <p className="text-purple-300">This shared content is protected</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
                  required
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  {loading ? 'Verifying...' : 'Unlock Content'}
                </button>
              </form>
            </div>
          )}

          {/* Access Denied */}
          {!content && !needsPassword && !loading && (
            <div className="text-center py-12">
              <div className="bg-red-500 p-5 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Access Denied</h2>
              <p className="text-red-300 text-lg mb-8">{error || 'This link is no longer valid'}</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
              >
                Go Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicAccess;