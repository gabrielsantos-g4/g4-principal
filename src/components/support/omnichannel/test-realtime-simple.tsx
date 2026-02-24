"use client";

import { useEffect, useState } from "react";
import { getSupabaseRealtimeClient } from "@/lib/supabase-realtime";

/**
 * Componente de teste simples para isolar o problema do Realtime
 * Testa apenas a conexão básica sem filtros complexos
 */
export function TestRealtimeSimple({ empresaId }: { empresaId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  const addLog = (message: string) => {
    console.log(`[TestRealtime] ${message}`);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (!empresaId) return;

    setStatus("testing");
    addLog("🚀 Iniciando teste de conexão Realtime...");

    const supabase = getSupabaseRealtimeClient();
    addLog("✅ Cliente Supabase obtido (singleton)");

    // Teste 1: Canal simples sem postgres_changes
    const testChannel1 = supabase
      .channel(`test-simple-${empresaId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: "" },
        },
      })
      .subscribe((status: string, err?: Error) => {
        addLog(`📡 Canal simples - Status: ${status}`);
        if (err) {
          addLog(`❌ Canal simples - Erro: ${JSON.stringify(err)}`);
        }
        if (status === "SUBSCRIBED") {
          addLog("✅ Canal simples conectado com sucesso!");
          
          // Agora testa com postgres_changes
          setTimeout(() => {
            addLog("🔄 Testando canal com postgres_changes...");
            
            const testChannel2 = supabase
              .channel(`test-postgres-${empresaId}`, {
                config: {
                  broadcast: { self: false },
                  presence: { key: "" },
                },
              })
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "main_crm",
                  filter: `empresa_id=eq.${empresaId}`,
                },
                (payload: any) => {
                  addLog(`📨 Recebido evento: ${JSON.stringify(payload)}`);
                }
              )
              .subscribe((status: string, err?: Error) => {
                addLog(`📡 Canal postgres_changes - Status: ${status}`);
                if (err) {
                  addLog(`❌ Canal postgres_changes - Erro: ${JSON.stringify(err)}`);
                  setStatus("error");
                }
                if (status === "SUBSCRIBED") {
                  addLog("✅ Canal postgres_changes conectado com sucesso!");
                  setStatus("success");
                }
                if (status === "CHANNEL_ERROR") {
                  addLog("❌ CHANNEL_ERROR detectado!");
                  setStatus("error");
                }
              });
          }, 2000);
        }
        if (status === "CHANNEL_ERROR") {
          addLog("❌ CHANNEL_ERROR no canal simples!");
          setStatus("error");
        }
      });

    return () => {
      addLog("🧹 Limpando canais de teste...");
      supabase.removeAllChannels();
    };
  }, [empresaId]);

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-black/90 border border-white/20 rounded-lg p-4 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">Teste Realtime</h3>
        <div
          className={`w-3 h-3 rounded-full ${
            status === "idle"
              ? "bg-gray-500"
              : status === "testing"
              ? "bg-yellow-500 animate-pulse"
              : status === "success"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="text-xs text-gray-300 font-mono">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
