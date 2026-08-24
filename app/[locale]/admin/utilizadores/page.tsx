"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { UserPlus, Mail, Shield, ShieldAlert, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("admin");
    const [filterPlan, setFilterPlan] = useState<string>("all");

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Plans for filtering
    const PLANS = ["Gratuito", "Básico", "Premium", "Business Vendedor", "Parceiro"];

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/list-users');
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Erro ao carregar utilizadores");

            // Sort: admins first, then by creation date
            const sorted = (result.users || []).sort((a: any, b: any) => {
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setUsers(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const [invitePassword, setInvitePassword] = useState("");
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async () => {
        if (!inviteEmail) return;

        setIsInviting(true);
        try {
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    password: invitePassword || undefined,
                    plan: 'Free'
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Erro ao criar utilizador");

            alert("Utilizador criado com sucesso!");
            setIsInviteOpen(false);
            setInviteEmail("");
            setInvitePassword("");
            fetchUsers();
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setIsInviting(false);
        }
    };

    const handleEdit = (user: any) => {
        router.push(`/admin/utilizadores/${user.id}`);
    };

    const handleDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/admin/delete-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userToDelete.id })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao eliminar utilizador");
            }

            alert("Utilizador eliminado com sucesso!");
            fetchUsers();
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };


    const columns = [
        {
            header: "Utilizador",
            key: "email",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden relative">
                        {row.avatar_url ? (
                            <img
                                src={row.avatar_url}
                                alt={row.full_name || val}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    (e.target as HTMLImageElement).src = "";
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                }}
                            />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{row.full_name || 'Sem nome'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{val}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Plano",
            key: "plan",
            render: (val: string) => {
                const colors: Record<string, string> = {
                    Free: "bg-slate-100 text-slate-500",
                    Básico: "bg-blue-50 text-blue-600",
                    Premium: "bg-purple-50 text-purple-600",
                    "Business Vendedor": "bg-orange-50 text-orange-600",
                    Parceiro: "bg-emerald-50 text-emerald-600"
                };
                return (
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${colors[val] || "bg-slate-100 text-slate-500"}`}>
                        {val || 'Free'}
                    </span>
                );
            }
        },
        {
            header: "Função",
            key: "role",
            render: (val: string) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${val === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-500'
                    }`}>
                    {val === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {val || 'User'}
                </span>
            )
        },
        {
            header: "Data Registo",
            key: "created_at",
            render: (val: string) => (
                <span className="text-slate-400 text-xs font-medium">
                    {val ? new Date(val).toLocaleDateString() : '-'}
                </span>
            )
        }
    ];

    useAdminTopBar("");

    return (
        <div className="space-y-8">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Utilizadores" />

                <div className="flex items-center gap-2 shrink-0">
                    <select
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                    >
                        <option value="all">Todos os Planos</option>
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Adicionar Utilizador
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Convidar Utilizador</DialogTitle>
                                <DialogDescription>
                                    Envie um convite por email para um novo administrador ou editor.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                    <Input
                                        placeholder="email@exemplo.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Função</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                    >
                                        <option value="admin">Administrador</option>
                                        <option value="editor">Editor</option>
                                        <option value="contribuidor">Contribuidor</option>
                                        <option value="user">Utilizador</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                                    <Input
                                        type="password"
                                        placeholder="Senha temporária"
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400">Se deixar em branco, uma senha aleatória será gerada.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
                                <Button onClick={handleInvite} disabled={isInviting} className="bg-emerald-600 hover:bg-emerald-700">
                                    {isInviting ? "A criar..." : "Criar Utilizador"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <AdminDataTable
                title="Utilizadores do Systema"
                columns={columns}
                data={filterPlan === 'all' ? users : users.filter(u => (u.plan || 'Gratuito') === filterPlan)}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Utilizador"
                description={`Tem a certeza que deseja eliminar o utilizador ${userToDelete?.email}? Esta acção é irreversível e removerá todos os dados associados.`}
                confirmLabel={isDeleting ? "A eliminar..." : "Eliminar Permanentemente"}
                cancelLabel="Cancelar"
                variant="destructive"
            />
        </div>
    );
}
