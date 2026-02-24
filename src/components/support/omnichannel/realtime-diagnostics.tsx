"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";

interface DiagnosticResult {
  step: string;
  status: "pending" | "success" | "error";
  message: string;
  details?: any;
}

export function RealtimeDiagnostics({ empresaId }: { empresaId: string }) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addDiagnostic = (result: DiagnosticResult) => {
    setDiagnostics((prev) => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    // Step 1: Check environment variables
    addDiagnostic({
      step: "Environment Variables",
      status: "pending",
      message: "Checking environment variables...",
    });

    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasUrl && hasKey) {
      addDiagnostic({
        step: "Environment Variables",
        status: "success",
        message: "Environment variables found",
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
        },
      });
    } else {
      addDiagnostic({
        step: "Environment Variables",
        status: "error",
        message: "Missing environment variables",
        details: { hasUrl, hasKey },
      });
      setIsRunning(false);
      return;
    }

    // Step 2: Create Supabase client
    addDiagnostic({
      step: "Supabase Client",
      status: "pending",
      message: "Creating Supabase client...",
    });

    let supabase;
    try {
      supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      addDiagnostic({
        step: "Supabase Client",
        status: "success",
        message: "Supabase client created successfully",
      });
    } catch (error: any) {
      addDiagnostic({
        step: "Supabase Client",
        status: "error",
        message: "Failed to create Supabase client",
        details: error.message,
      });
      setIsRunning(false);
      return;
    }

    // Step 3: Check authentication
    addDiagnostic({
      step: "Authentication",
      status: "pending",
      message: "Checking authentication...",
    });

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        addDiagnostic({
          step: "Authentication",
          status: "success",
          message: "User authenticated",
          details: { userId: user.id, email: user.email },
        });
      } else {
        addDiagnostic({
          step: "Authentication",
          status: "error",
          message: "No authenticated user",
        });
        setIsRunning(false);
        return;
      }
    } catch (error: any) {
      addDiagnostic({
        step: "Authentication",
        status: "error",
        message: "Authentication check failed",
        details: error.message,
      });
      setIsRunning(false);
      return;
    }

    // Step 4: Test Realtime connection
    addDiagnostic({
      step: "Realtime Connection",
      status: "pending",
      message: "Testing Realtime connection...",
    });

    try {
      const channelName = `diagnostic-test-${Date.now()}`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: '' }
        }
      });

      const subscribePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout after 10 seconds"));
        }, 10000);

        channel.subscribe((status, err) => {
          clearTimeout(timeout);
          if (status === "SUBSCRIBED") {
            resolve(status);
          } else if (status === "CHANNEL_ERROR") {
            reject(err || new Error("Channel error"));
          } else if (status === "TIMED_OUT") {
            reject(new Error("Connection timed out"));
          } else if (status === "CLOSED") {
            reject(new Error("Connection closed"));
          }
        });
      });

      await subscribePromise;

      addDiagnostic({
        step: "Realtime Connection",
        status: "success",
        message: "Realtime connection established",
      });

      // Cleanup
      await supabase.removeChannel(channel);
    } catch (error: any) {
      addDiagnostic({
        step: "Realtime Connection",
        status: "error",
        message: "Realtime connection failed",
        details: error.message,
      });
      setIsRunning(false);
      return;
    }

    // Step 5: Test postgres_changes subscription
    addDiagnostic({
      step: "Postgres Changes",
      status: "pending",
      message: "Testing postgres_changes subscription...",
    });

    try {
      const channelName = `diagnostic-postgres-${Date.now()}`;
      const channel = supabase
        .channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: '' }
          }
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "main_crm",
            filter: `empresa_id=eq.${empresaId}`,
          },
          () => {
            console.log("Test postgres_changes callback");
          }
        );

      const subscribePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Subscription timeout after 10 seconds"));
        }, 10000);

        channel.subscribe((status, err) => {
          clearTimeout(timeout);
          if (status === "SUBSCRIBED") {
            resolve(status);
          } else if (status === "CHANNEL_ERROR") {
            reject(err || new Error("Channel error"));
          } else if (status === "TIMED_OUT") {
            reject(new Error("Subscription timed out"));
          }
        });
      });

      await subscribePromise;

      addDiagnostic({
        step: "Postgres Changes",
        status: "success",
        message: "postgres_changes subscription successful",
      });

      // Cleanup
      await supabase.removeChannel(channel);
    } catch (error: any) {
      addDiagnostic({
        step: "Postgres Changes",
        status: "error",
        message: "postgres_changes subscription failed",
        details: error.message,
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            Realtime Connection Diagnostics
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Testing WebSocket connection to Supabase Realtime
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className="bg-[#111] border border-white/5 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(diagnostic.status)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">
                    {diagnostic.step}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {diagnostic.message}
                  </p>
                  {diagnostic.details && (
                    <pre className="mt-2 text-xs text-gray-500 bg-black/30 p-2 rounded overflow-x-auto">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}

          {diagnostics.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="w-full bg-[#1C73E8] hover:bg-[#1a67d4] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isRunning ? "Running Diagnostics..." : "Run Diagnostics Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
