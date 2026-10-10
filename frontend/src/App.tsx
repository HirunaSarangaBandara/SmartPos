
import { useEffect, useState } from "react";
import { auth } from "./config/firebase";
import { checkBackendHealth } from "./services/healthService";

function App() {
  const [backendStatus, setBackendStatus] =
    useState("CHECKING");

  const [backendMessage, setBackendMessage] =
    useState("");

  useEffect(() => {
    checkBackendHealth()
      .then((response) => {
        setBackendStatus(response.status);
        setBackendMessage(response.message);
      })
      .catch(() => {
        setBackendStatus("OFFLINE");
        setBackendMessage("Backend connection failed.");
      });
  }, []);

  const firebaseConfigured = Boolean(
    auth.app.options.projectId &&
    auth.app.options.apiKey
  );

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-blue-700">
          SmartPOS
        </h1>

        <p className="mt-2 text-gray-500">
          Development Environment — Day 3
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold">
              Spring Boot Backend
            </h2>

            <p className="mt-2">
              Status: {backendStatus}
            </p>

            <p className="text-sm text-gray-500">
              {backendMessage}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold">
              Firebase Web SDK
            </h2>

            <p className="mt-2">
              Configuration:{" "}
              {firebaseConfigured
                ? "INITIALIZED"
                : "MISSING"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Project ID:{" "}
              {auth.app.options.projectId ?? "Not configured"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;