import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateVault = ({ showNotification }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://time-bound-digital-access-vault-s4k.vercel.app/api/vaults', {
        method: 'POST',
        credentials: 'include', // Sends the httpOnly cookie automatically
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Vault item created successfully!', 'success');
        navigate('/dashboard'); // Navigate back to dashboard
      } else {
        setError(data.message || 'Failed to create vault item');
      }
    } catch (err) {
      console.error('Create vault error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 text-purple-300 hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6">Create Vault Item</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Title Field */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="e.g., API Keys, Personal Notes, Credentials"
                required
                autoFocus
              />
            </div>

            {/* Content Field */}
            <div>
              <label className="block text-purple-200 mb-2 font-semibold">
                Sensitive Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 min-h-64 font-mono resize-none transition-colors"
                placeholder="Enter your sensitive data here..."
                required
              />
              <p className="text-purple-400 text-sm mt-2">
                This content will be encrypted and stored securely
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200"
              >
                {loading ? 'Creating...' : 'Create Vault Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVault;