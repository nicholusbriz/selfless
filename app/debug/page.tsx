export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🔧 Debug Info</h1>
        <div className="space-y-2 text-sm">
          <p><strong>Site:</strong> selfless-henna.vercel.app</p>
          <p><strong>Status:</strong> Basic rendering test</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
        </div>
        
        <div className="mt-6 space-y-3">
          <div className="bg-green-50 p-3 rounded">
            <p className="text-green-800 font-semibold">✅ If you can see this page:</p>
            <ul className="text-green-700 text-sm mt-1">
              <li>• Next.js is working</li>
              <li>• Routing is functional</li>
              <li>• Build was successful</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-800 font-semibold">🔍 Next steps:</p>
            <ul className="text-blue-700 text-sm mt-1">
              <li>• Test: /api/ping</li>
              <li>• Test: /api/health</li>
              <li>• Check Vercel logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
