"use client";

import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, QrCode, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getWhatsAppInstance, WhatsAppInstance } from "@/actions/whatsapp-actions";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

interface ChannelsConfigProps {
    companyId: string;
}

export function ChannelsConfig({ companyId }: ChannelsConfigProps) {
    const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        async function fetchInstance() {
            setLoading(true);
            const data = await getWhatsAppInstance(companyId);
            setInstance(data);
            setLoading(false);
        }

        fetchInstance();

        // Realtime Subscription
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel('whatsapp-instance-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'instance_wa_chaterly',
                    filter: `empresa=eq.${companyId}`
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    if (payload.eventType === 'DELETE') {
                        setInstance(null);
                    } else {
                        setInstance(payload.new as WhatsAppInstance);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [companyId]);

    const handleGenerateQR = async () => {
        setGenerating(true);
        try {
            const response = await fetch('https://hook.startg4.com/webhook/4a013f33-88e1-46ea-8028-c318f966d599', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    supabase_uid: companyId,
                    acao: 'gerarQr'
                }),
            });

            if (response.ok) {
                toast.success("Solicitação de QR Code enviada!");
            } else {
                toast.error("Falha ao solicitar QR Code.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar solicitação.");
        } finally {
            setGenerating(false);
        }
    };

    const showGenerateButton = !instance || instance.status === 'FAILED';

    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5">
            <h2 className="text-lg font-bold text-white mb-6">Channels & Connectors</h2>

            <div className="space-y-4">
                {/* WhatsApp */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-white w-24">WhatsApp</span>

                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                            ) : (
                                <>
                                    {showGenerateButton ? (
                                        <Button
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 h-8 text-xs font-bold"
                                            onClick={handleGenerateQR}
                                            disabled={generating}
                                        >
                                            {generating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                            Generate QR Code <QrCode size={14} className="ml-2" />
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            {instance.status}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {/* Display QR Code or Profile Picture */}
                        {(() => {
                            // Normalize status
                            const status = instance?.status?.toLowerCase()?.trim();
                            const hasQrCode = !!instance?.qr_code;

                            // Status checks
                            const isQrStatus = status === 'qrcode' || status === 'qr_code' || status === 'qr code';
                            const isWorking = status === 'working';

                            // Show Profile Picture (Working)
                            if (isWorking) {
                                return (
                                    <div className="flex items-center gap-4 animate-in fade-in duration-500">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-500/50 shadow-sm shadow-green-500/20 shrink-0">
                                            {instance?.avatar ? (
                                                <img
                                                    src={instance.avatar}
                                                    alt="WhatsApp Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                    <span className="text-[10px]">No Pic</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">Connected</span>
                                            <span className="text-[10px] text-green-400">Syncing messages...</span>
                                        </div>
                                    </div>
                                )
                            }

                            // Show QR Code
                            if (isQrStatus && hasQrCode) {
                                return (
                                    <div className="flex flex-col items-center gap-2 mt-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            <img
                                                src={instance.qr_code!.startsWith('data:') ? instance.qr_code! : `data:image/png;base64,${instance.qr_code}`}
                                                alt="WhatsApp QR Code"
                                                className="w-[180px] h-[180px] object-contain"
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400">Scan code with WhatsApp</span>
                                    </div>
                                )
                            }

                            return null;
                        })()}
                    </div>
                </div>

                {/* Web Chat */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-white w-24 shrink-0">Web chat</span>

                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-[10px] text-gray-500 font-bold">Profile Picture</div>
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img src="https://i.pinimg.com/736x/24/29/61/2429617ce5e50f631606f92b65aaeb0f.jpg" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="text-xs text-gray-500 font-mono truncate max-w-[300px]">https://app.startg4.com/chat?utm_source=g4</div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Copy URL <Copy size={12} className="ml-2" />
                                    </Button>
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Open page <ExternalLink size={12} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bubble Chat */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-white w-24 shrink-0">Bubble chat</span>

                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-[10px] text-gray-500 font-bold">Profile Picture</div>
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img src="https://i.pinimg.com/736x/24/29/61/2429617ce5e50f631606f92b65aaeb0f.jpg" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2 mt-4">
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Copy Code <Copy size={12} className="ml-2" />
                                    </Button>
                                    <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold">
                                        Tutorial video <ExternalLink size={12} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
