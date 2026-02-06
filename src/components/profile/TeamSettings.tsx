'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Loader2, Save, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createCompanyUser, updateCompanyUser, getCompanyUsers, deleteCompanyUser } from '@/actions/users'
import { toast } from 'sonner'

interface UseProfile {
    id: string
    name: string
    email: string
    role: string
    avatar_url: string
}

export function TeamSettings() {
    const [users, setUsers] = useState<UseProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState<UseProfile | null>(null)
    const [deleteUser, setDeleteUser] = useState<UseProfile | null>(null)

    // Create Form State
    const [creating, setCreating] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        const data = await getCompanyUsers()
        setUsers(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className="space-y-8">
            {/* Create User Card */}
            <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-white">Add New User</h3>
                    <p className="text-sm text-slate-400">Create a new user account for your team member.</p>
                </div>

                <CreateUserForm onSuccess={fetchUsers} />
            </div>

            {/* Humans List */}
            <div>
                <h3 className="text-lg font-medium text-white mb-4">Users with access</h3>
                <div className="rounded-md border border-white/10 overflow-hidden bg-[#0c0c0c]">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-slate-400">Name</TableHead>
                                <TableHead className="text-slate-400">Email</TableHead>
                                <TableHead className="text-slate-400">Role</TableHead>
                                <TableHead className="text-right text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold overflow-hidden border border-white/10">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">{user.email}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'admin'
                                                ? 'bg-purple-400/10 text-purple-400 ring-purple-400/20'
                                                : 'bg-blue-400/10 text-blue-400 ring-blue-400/20'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.role !== 'admin' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                                        onClick={() => setEditingUser(user)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                                                        onClick={() => setDeleteUser(user)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">Owner</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-[425px]">
                    {editingUser && (
                        <UserForm
                            mode="edit"
                            initialData={editingUser}
                            onSuccess={() => {
                                setEditingUser(null)
                                fetchUsers()
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle size={20} />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 pt-2">
                            Are you sure you want to delete <span className="text-white font-medium">{deleteUser?.name}</span>?
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
                            onClick={() => setDeleteUser(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            onClick={async () => {
                                if (deleteUser) {
                                    const res = await deleteCompanyUser(deleteUser.id)
                                    if (res.error) {
                                        toast.error(res.error)
                                    } else {
                                        toast.success('User deleted successfully')
                                        fetchUsers()
                                    }
                                    setDeleteUser(null)
                                }
                            }}
                        >
                            Delete User
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await createCompanyUser(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('User created successfully')
                // Reset form manually since we don't have ref here easily without more code, 
                // but standard form reset works if we target the element.
                // We'll trust the user to clear or we can force reset.
                // Actually, simplest way to clear inputs:
                const form = document.getElementById('create-user-form') as HTMLFormElement
                if (form) form.reset()

                onSuccess()
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form id="create-user-form" action={handleSubmit} className="grid sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-4 space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                    required
                />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Login)</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                    required
                />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white focus:bg-white/10"
                    required
                    minLength={6}
                />
            </div>

            <div className="sm:col-span-1">
                <Button type="submit" className="w-full bg-[#1C73E8] hover:bg-[#1557b0] text-white" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
            </div>
        </form>
    )
}

function UserForm({ mode, initialData, onSuccess }: { mode: 'create' | 'edit', initialData?: UseProfile, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError('')

        try {
            let result
            if (mode === 'create') {
                result = await createCompanyUser(formData)
            } else {
                result = await updateCompanyUser(formData)
            }

            if (result.error) {
                setError(result.error)
            } else {
                toast.success(mode === 'create' ? 'User created successfully' : 'User updated successfully')
                onSuccess()
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{mode === 'create' ? 'Add New User' : 'Edit User'}</DialogTitle>
                <DialogDescription className="text-slate-400">
                    {mode === 'create'
                        ? 'Create a new user account.'
                        : 'Update user details. Leave password empty to keep current password.'}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {mode === 'edit' && <input type="hidden" name="userId" value={initialData?.id} />}

                <div className="grid gap-2">
                    <Label htmlFor="edit-name" className="text-slate-300">Name</Label>
                    <Input
                        id="edit-name"
                        name="name"
                        defaultValue={initialData?.name}
                        placeholder="John Doe"
                        className="bg-white/5 border-white/10 text-white"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-email" className="text-slate-300">Email</Label>
                    <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        defaultValue={initialData?.email}
                        placeholder="john@company.com"
                        className="bg-white/5 border-white/10 text-white"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-password" className="text-slate-300">
                        {mode === 'create' ? 'Password' : 'New Password (Optional)'}
                    </Label>
                    <Input
                        id="edit-password"
                        name="password"
                        type="password"
                        placeholder={mode === 'create' ? "••••••••" : "Leave empty to keep current"}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        required={mode === 'create'}
                        minLength={6}
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}
            </div>
            <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {mode === 'create' ? 'Create User' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
    )
}
