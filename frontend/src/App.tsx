
import { useEffect, useState } from "react";
import { checkBackendHealth } from "./services/healthService";

function App() {
  const [status, setStatus] = useState("CHECKING");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await checkBackendHealth();
        setStatus(response.status);
        setMessage(response.message);
      } catch {
        setStatus("OFFLINE");
        setMessage("Unable to connect to Spring Boot backend.");
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="text-4xl font-bold text-blue-700">
          SmartPOS
        </h1>

        <p className="mt-2 text-gray-500">
          Point of Sale & Inventory Management System
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-700">
            Backend Connection
          </h2>

          <div className="mt-4 flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                status === "UP"
                  ? "bg-green-500"
                  : status === "CHECKING"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />

            <span
              className={`font-bold ${
                status === "UP"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {status}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {message}
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          SmartPOS Development Environment
        </p>
      </div>
    </div>
  );
}

export default App;