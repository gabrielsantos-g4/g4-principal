'use client';

import { useState, useEffect } from "react";
import { getChatMessages } from "@/actions/inbox/get-messages";
import { getConversations } from "@/actions/inbox/get-conversations";
import { getCompanySettings } from "@/actions/settings-actions";

export default function DiagnosticsPage() {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${msg}`]);
    };

    useEffect(() => {
        addLog("Starting Diagnostics...");

        const runDiagnostics = async () => {
            try {
                // We need to fetch something that would map to a known user/empresa
                // For a quick test, let's just test getChatMessages with a known conversation ID
                // Or just test if setInterval runs properly and state updates.

                let counter = 0;
                addLog("Starting setInterval test...");
                const interval = setInterval(() => {
                    counter++;
                    addLog(`Interval tick ${counter}`);
                    if (counter >= 3) clearInterval(interval);
                }, 2000);
            } catch (err: any) {
                addLog(`Error: ${err.message}`);
            }
        };

        runDiagnostics();
    }, []);

    return (
        <div className="p-8 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Realtime Diagnostics</h1>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm h-[600px] overflow-y-auto">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
}
