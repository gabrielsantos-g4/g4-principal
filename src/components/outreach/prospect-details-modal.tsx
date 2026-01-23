'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Prospect } from '@/actions/outreach-actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProspectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    prospect: Prospect;
    onSave: (id: string, data: Partial<Prospect>) => Promise<void>;
}

export function ProspectDetailsModal({ isOpen, onClose, prospect, onSave }: ProspectDetailsModalProps) {
    const [formData, setFormData] = useState<Partial<Prospect>>({
        company_name: prospect.company_name || '',
        decisor_name: prospect.decisor_name || '',
        role: prospect.role || '',
        phone_1: prospect.phone_1 || '',
        phone_2: prospect.phone_2 || '',
        email_1: prospect.email_1 || '',
        email_2: prospect.email_2 || '',
        linkedin_profile: prospect.linkedin_profile || '',
        status: prospect.status || 'Pending',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof Prospect, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(prospect.id, formData);
            toast.success('Prospect updated successfully');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update prospect');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Prospect</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSave();
                    }
                }}>
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                            id="company_name"
                            value={formData.company_name || ''}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="decisor_name">Decisor Name</Label>
                        <Input
                            id="decisor_name"
                            value={formData.decisor_name || ''}
                            onChange={(e) => handleChange('decisor_name', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            value={formData.role || ''}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <div className="relative">
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className={`w-full appearance-none rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-[#1A1A1A] ${formData.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        formData.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            formData.status === 'Pending' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    } uppercase font-bold text-xs tracking-wider`}
                            >
                                <option value="Pending" className="bg-[#1A1A1A] text-gray-400 font-bold">PENDING</option>
                                <option value="Needs Review" className="bg-[#1A1A1A] text-amber-400 font-bold">NEEDS REVIEW</option>
                                <option value="Approved" className="bg-[#1A1A1A] text-emerald-400 font-bold">APPROVED</option>
                                <option value="Rejected" className="bg-[#1A1A1A] text-red-400 font-bold">REJECTED</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_1">Phone 1</Label>
                        <Input
                            id="phone_1"
                            value={formData.phone_1 || ''}
                            onChange={(e) => handleChange('phone_1', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_2">Phone 2</Label>
                        <Input
                            id="phone_2"
                            value={formData.phone_2 || ''}
                            onChange={(e) => handleChange('phone_2', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email_1">Email 1</Label>
                        <Input
                            id="email_1"
                            value={formData.email_1 || ''}
                            onChange={(e) => handleChange('email_1', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email_2">Email 2</Label>
                        <Input
                            id="email_2"
                            value={formData.email_2 || ''}
                            onChange={(e) => handleChange('email_2', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                        <Input
                            id="linkedin_profile"
                            value={formData.linkedin_profile || ''}
                            onChange={(e) => handleChange('linkedin_profile', e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-white hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
