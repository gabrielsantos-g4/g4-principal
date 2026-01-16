"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, QrCode, Loader2, Save, Plus, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getWhatsAppInstances, createWhatsAppInstance, deleteWhatsAppInstance, WhatsAppInstance } from "@/actions/whatsapp-actions";
import { getCompanySettings, updateAgentName } from "@/actions/settings-actions";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface ChannelsConfigProps {
    companyId: string;
    showWebChat?: boolean;
}

export function ChannelsConfig({ companyId, showWebChat = true }: ChannelsConfigProps) {
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [agentName, setAgentName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [savingName, setSavingName] = useState(false);

    // New Instance Modal State
    const [newInstanceOpen, setNewInstanceOpen] = useState(false);
    const [newInstanceName, setNewInstanceName] = useState("");
    const [creatingInstance, setCreatingInstance] = useState(false);

    // Delete Instance State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [instanceToDelete, setInstanceToDelete] = useState<WhatsAppInstance | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchInstances = async (silent = false) => {
        if (!silent) setLoading(true);
        const [waInstances, settings] = await Promise.all([
            getWhatsAppInstances(companyId),
            getCompanySettings(companyId)
        ]);
        setInstances(waInstances);
        if (settings) {
            setAgentName(settings.wpp_name);
            setCompanyName(settings.name);
        }
        if (!silent) setLoading(false);
    };

    useEffect(() => {
        fetchInstances();

        // Realtime Subscription
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const uniqueChannelId = `whatsapp-updates-${companyId}-${Date.now()}`;
        const channel = supabase
            .channel(uniqueChannelId)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'instance_wa_chaterly',
                    filter: `empresa=eq.${companyId}`
                },
                () => {
                    // Refetch triggers a full update, ensuring consistency (silent update)
                    fetchInstances(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [companyId]);

    const handleDeleteInstance = async () => {
        if (!instanceToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteWhatsAppInstance(instanceToDelete.uid, companyId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Instância excluída com sucesso!");
                setDeleteDialogOpen(false);
                setInstanceToDelete(null);
                // Silent refresh
                fetchInstances(true);
            }
        } catch (error) {
            console.error("Delete instance exception:", error);
            toast.error("Erro ao excluir instância.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateInstance = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingInstance(true);

        const normalizedName = newInstanceName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9-_]/g, "")
            .toLowerCase();

        try {
            const result = await createWhatsAppInstance(normalizedName, companyId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Instância criada com sucesso!");
                setNewInstanceOpen(false);
                setNewInstanceName("");
                // Refresh manually to be safe
                const waInstances = await getWhatsAppInstances(companyId);
                setInstances(waInstances);
            }
        } catch (error) {
            toast.error("Erro ao criar instância.");
        } finally {
            setCreatingInstance(false);
        }
    };

    const handleGenerateQR = async (instanceIdentifier: string) => {
        setGenerating(instanceIdentifier);
        try {
            const response = await fetch('https://hook.startg4.com/webhook/4a013f33-88e1-46ea-8028-c318f966d599', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    supabase_uid: instanceIdentifier, // Use 'nome' here as it holds the Waha Session ID
                    acao: 'gerarQr'
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // If backend returns QR code directly, update state immediately
                if (data.status === 'qrcode' && data.qrcode) {
                    setInstances(prev => prev.map(inst =>
                        inst.uid === instanceIdentifier
                            ? { ...inst, status: 'qrcode', qr_code: data.qrcode }
                            : inst
                    ));
                }

                toast.success("Solicitação de QR Code enviada!");
            } else {
                toast.error("Falha ao solicitar QR Code.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar solicitação.");
        } finally {
            setGenerating(null);
        }
    };

    const handleSaveName = async () => {
        setSavingName(true);
        try {
            await updateAgentName(companyId, agentName);
            toast.success("Agent name updated successfully");
        } catch (error) {
            toast.error("Failed to update agent name");
        } finally {
            setSavingName(false);
        }
    };

    const handleCopyWebChatUrl = () => {
        const url = `https://chat.startg4.com/chat?utm_source=${encodeURIComponent(companyName)}`;
        navigator.clipboard.writeText(url);
        toast.success("Web Chat URL copied to clipboard");
    };

    const handleOpenWebChat = () => {
        const url = `https://chat.startg4.com/chat?utm_source=${encodeURIComponent(companyName)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-[#111] p-6 rounded-lg border border-white/5">
            <h2 className="text-lg font-bold text-white mb-6">Channels & Connectors</h2>

            <div className="space-y-4">
                {/* Agent Name */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <span className="font-bold text-white w-24">Agent Name</span>
                            <div className="flex items-center gap-2 max-w-md w-full">
                                <Input
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    placeholder="e.g. My Support Agent"
                                    className="h-8 bg-white/5 border-white/10 text-white"
                                />
                                <Button
                                    onClick={handleSaveName}
                                    disabled={savingName}
                                    size="sm"
                                    className="h-8 bg-white/10 hover:bg-white/20 text-white"
                                >
                                    {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save size={14} />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Instances Table */}
                <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white">WhatsApp Instances</span>
                            <Dialog open={newInstanceOpen} onOpenChange={setNewInstanceOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#1C73E8] hover:bg-[#1557b0] text-white h-8 text-xs">
                                        <Plus className="mr-2 h-3 w-3" />
                                        Nova Instância
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-white/10 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Nova Instância</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                            Crie uma nova instância para conectar seu WhatsApp.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateInstance} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome da Instância</Label>
                                            <Input
                                                id="name"
                                                value={newInstanceName}
                                                onChange={(e) => setNewInstanceName(e.target.value)}
                                                placeholder="Ex: Comercial"
                                                className="bg-[#0f0f0f] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#1C73E8]"
                                                required
                                            />
                                            <p className="text-xs text-gray-500">
                                                Apenas letras, números, hífens e underlines.
                                            </p>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setNewInstanceOpen(false)}
                                                disabled={creatingInstance}
                                                className="border-white/10 hover:bg-white/5 text-gray-300"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={creatingInstance || !newInstanceName}
                                                className="bg-[#1C73E8] hover:bg-[#1557b0] text-white"
                                            >
                                                {creatingInstance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Criar
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                        ) : instances.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 text-sm border border-dashed border-white/10 rounded-lg">
                                Nenhuma instância conectada. Clique em "Nova Instância" para começar.
                            </div>
                        ) : (
                            <div className="rounded-md border border-white/10 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="text-gray-400">Instância</TableHead>

                                            <TableHead className="text-center text-gray-400">Status</TableHead>
                                            <TableHead className="text-center text-gray-400">QR Code</TableHead>
                                            <TableHead className="text-right text-gray-400">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instances.map((inst) => {
                                            const displayId = inst.nome || inst.uid;
                                            const displayName = inst.nome ? inst.nome.split('_')[0] : 'Instance';
                                            const status = inst.status?.toLowerCase()?.trim() || 'unknown';
                                            const hasQrCode = !!inst.qr_code;
                                            const isQrStatus = status === 'qrcode' || status === 'qr_code' || status === 'qr code';
                                            const isWorking = status === 'working';
                                            const isPending = status === 'stopped' || status === 'unknown' || status === 'failed';

                                            return (
                                                <TableRow key={inst.uid} className="border-white/5 hover:bg-white/[0.02]">
                                                    <TableCell className="font-medium text-white">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                                                                {inst.avatar ? (
                                                                    <img src={inst.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Smartphone size={14} className="text-white/50" />
                                                                )}
                                                            </div>
                                                            <span>{displayName}</span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${isWorking ? 'bg-green-500/20 text-green-500' :
                                                            isQrStatus ? 'bg-yellow-500/20 text-yellow-500' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                            {isWorking ? 'Online' : isQrStatus ? 'QR Code' : 'Desconectado'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isQrStatus && hasQrCode ? (
                                                            <div className="flex justify-center p-2">
                                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                                                                    <img
                                                                        src={inst.qr_code!.startsWith('data:') ? inst.qr_code! : `data:image/png;base64,${inst.qr_code}`}
                                                                        alt="QR Code"
                                                                        className="w-[180px] h-[180px] object-contain"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-600">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {!isWorking && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-xs hover:bg-white/10 text-gray-300"
                                                                    onClick={() => handleGenerateQR(inst.uid)}
                                                                    disabled={generating === inst.uid}
                                                                >
                                                                    {generating === inst.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : "Conectar"}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                                onClick={() => {
                                                                    setInstanceToDelete(inst);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                            {isWorking && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                                    disabled // Placeholder for disconnect functionality
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>

                {showWebChat && (
                    <>
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
                                        <div className="flex gap-2 items-center h-full pt-2">
                                            <Button
                                                variant="secondary"
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold"
                                                onClick={handleCopyWebChatUrl}
                                            >
                                                Copy URL <Copy size={12} className="ml-2" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-7 text-xs font-bold"
                                                onClick={handleOpenWebChat}
                                            >
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
                    </>
                )}

            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Instância</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Tem certeza que deseja excluir a instância <strong>{instanceToDelete?.nome?.split('_')[0]}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 hover:bg-white/5 text-gray-300 bg-transparent">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteInstance();
                            }}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
