'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">✅ Site is Working!</h1>
        <p className="text-xl mb-8">Basic page rendering is successful</p>

        <div className="space-y-4">
          <button
            onClick={() => window.open('/api/health', '_blank')}
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Test Database Connection
          </button>

          <div className="text-sm text-gray-300">
            <p>Click the button above to test the database connection</p>
            <p>The health check will open in a new tab</p>
          </div>
        </div>
      </div>
    </div>
  );
}
