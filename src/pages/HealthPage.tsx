export function HealthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Service Healthy</h1>
        <p className="text-gray-600">Family Gallery is running smoothly</p>
        <p className="text-xs text-gray-400 mt-4">
          Version: {import.meta.env.VITE_APP_VERSION || "1.0.0"}
        </p>
      </div>
    </div>
  );
}
