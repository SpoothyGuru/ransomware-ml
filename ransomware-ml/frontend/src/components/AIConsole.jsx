import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import api, { aiComplete } from '../api';

const AIConsole = () => {
  const [prompt, setPrompt] = useState('Summarize the last scan results.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await aiComplete(prompt, 256, 0.2);
      setResult(res.completion || JSON.stringify(res.raw));
    } catch (err) {
      setError(err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-2">AI Assistant</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded resize-none"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Thinking…' : 'Ask AI'}
            <PaperAirplaneIcon className="w-4 h-4 ml-2 transform rotate-45" />
          </button>
        </div>
      </form>

      <div className="mt-3">
        {error && (
          <div className="text-sm text-red-600">Error: {error}</div>
        )}

        {result && (
          <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-800 whitespace-pre-wrap">{result}</div>
        )}
      </div>
    </div>
  );
};

export default AIConsole;
