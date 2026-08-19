"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import {
    Phone,
    Mail,
    Building2,
    Plus,
    Download,
    Search,
    CheckCircle2,
    Globe,
    Users,
    Loader2,
    Star,
    Copy as CopyIcon,
    Trash2,
    X,
    Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Spinner } from "@/components/ui/spinner";
import { getCachedList, setCachedList } from "@/lib/adminListCache";
import { useAdminTopBar, TOPBAR_NEW_BUTTON_CLASS } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

const CACHE_KEY = "contactos";

interface Contact {
    id: string;
    company_id: string | null;
    name: string;
    role: string;
    email: string;
    phone: string;
    phone_secondary: string;
    whatsapp: string;
    source: string;
    notes: string;
    is_verified: boolean;
    created_at: string;
    company?: {
        name: string;
        logo_url: string;
    };
}

export default function AdminContactosPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importStatus, setImportStatus] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [formData, setFormData] = useState({
        company_id: "",
        name: "",
        role: "",
        email: "",
        phone: "",
        phone_secondary: "",
        whatsapp: "",
        source: "manual",
        notes: "",
        is_verified: false
    });

    useEffect(() => {
        // Cache curto (90s) para não reprocessar a lista toda sempre que se
        // volta a esta página dentro da mesma sessão — sempre a actualizar
        // em segundo plano a seguir, mesmo com cache válido.
        const cached = getCachedList<Contact[]>(CACHE_KEY);
        if (cached) {
            setContacts(cached);
            setLoading(false);
        }
        fetchContacts(!cached);
        fetchCompanies();
    }, []);

    async function fetchContacts(showLoading = true) {
        if (showLoading) setLoading(true);
        const { data, error } = await supabase
            .from('contacts')
            .select(`
                *,
                company:companies(name, logo_url)
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error("Error fetching contacts:", error);
            // If table doesn't exist, show empty state
            setContacts([]);
        } else {
            setContacts(data || []);
            setCachedList(CACHE_KEY, data || []);
        }
        setLoading(false);
    }

    async function fetchCompanies() {
        const { data } = await supabase
            .from('companies')
            .select('id, name, website, activity')
            .order('name');
        setCompanies(data || []);
    }

    async function handleSave() {
        try {
            if (editingContact) {
                const { error } = await supabase
                    .from('contacts')
                    .update({
                        ...formData,
                        company_id: formData.company_id || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingContact.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('contacts')
                    .insert({
                        ...formData,
                        company_id: formData.company_id || null
                    });
                if (error) throw error;
            }
            toast.success(editingContact ? "Contacto atualizado!" : "Contacto adicionado!");
            setShowModal(false);
            setEditingContact(null);
            resetForm();
            fetchContacts();
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        }
    }

    async function confirmDelete() {
        if (!contactToDelete) return;
        try {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', contactToDelete.id);
            if (error) throw error;
            toast.success("Contacto eliminado com sucesso!");
            fetchContacts();
        } catch (error: any) {
            toast.error("Erro ao eliminar: " + error.message);
        } finally {
            setShowDeleteConfirm(false);
            setContactToDelete(null);
        }
    }

    async function handleBulkDelete() {
        setShowBulkDeleteConfirm(true);
    }

    async function confirmBulkDelete() {
        try {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .in('id', selectedIds);
            if (error) throw error;
            toast.success(`${selectedIds.length} contactos eliminados!`);
            setSelectedIds([]);
            fetchContacts();
        } catch (error: any) {
            toast.error("Erro na eliminação em massa: " + error.message);
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    }

    async function handleDelete(contact: Contact) {
        setContactToDelete(contact);
        setShowDeleteConfirm(true);
    }

    function resetForm() {
        setFormData({
            company_id: "",
            name: "",
            role: "",
            email: "",
            phone: "",
            phone_secondary: "",
            whatsapp: "",
            source: "manual",
            notes: "",
            is_verified: false
        });
    }

    function openEditModal(contact: Contact) {
        setEditingContact(contact);
        setFormData({
            company_id: contact.company_id || "",
            name: contact.name || "",
            role: contact.role || "",
            email: contact.email || "",
            phone: contact.phone || "",
            phone_secondary: contact.phone_secondary || "",
            whatsapp: contact.whatsapp || "",
            source: contact.source || "manual",
            notes: contact.notes || "",
            is_verified: contact.is_verified || false
        });
        setShowModal(true);
    }

    async function handleExport() {
        const csvRows = [
            ["Nome", "Empresa", "Email", "Telefone", "Filiacao"]
        ];

        contacts.forEach(c => {
            csvRows.push([
                c.name || "",
                c.company?.name || "",
                c.email || "",
                c.phone || "",
                c.notes || ""
            ]);
        });

        const csvContent = csvRows.map((e: any) => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "contactos_baseagro.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function handleManualImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            setImporting(true);
            setImportStatus(`A processar ficheiro: ${file.name}...`);

            try {
                let data: any[] = [];
                if (file.name.endsWith('.csv')) {
                    const text = await file.text();
                    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                    data = result.data;
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    const buffer = await file.arrayBuffer();
                    const workbook = XLSX.read(buffer);
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    data = XLSX.utils.sheet_to_json(sheet);
                }

                if (data.length === 0) throw new Error("O ficheiro está vazio ou é inválido.");

                setImportStatus(`A mapear ${data.length} contactos e empresas...`);

                // Simple company matching logic
                const companyMap = new Map();
                companies.forEach((c: any) => companyMap.set(c.name.toLowerCase().trim(), c.id));

                const contactsToInsert = data.map((row: any) => {
                    // Normalize keys (handle different CSV headers)
                    const name = row.Nome || row.name || row.Name || "";
                    const email = row.Email || row.email || row.EMAIL || "";
                    const phone = row.Telefone || row.phone || row.Phone || row.Telemovel || "";
                    const companyName = row.Empresa || row.company || row.Company || "";
                    const role = row.Cargo || row.role || row.Role || row.Posicao || "";

                    const companyId = companyName ? companyMap.get(companyName.toLowerCase().trim()) : null;

                    return {
                        name,
                        email,
                        phone,
                        role,
                        company_id: companyId || null,
                        source: 'manual_import',
                        notes: companyName && !companyId ? `Empresa não encontrada: ${companyName}` : ""
                    };
                }).filter((c: any) => c.name || c.email);

                if (contactsToInsert.length === 0) throw new Error("Nenhum contacto válido encontrado.");

                const { error } = await supabase.from('contacts').insert(contactsToInsert);
                if (error) throw error;

                toast.success(`${contactsToInsert.length} contactos importados com sucesso!`);
                setImportStatus(`Sucesso! ${contactsToInsert.length} contactos importados.`);
                fetchContacts();
            } catch (error: any) {
                console.error("Erro na importação:", error);
                toast.error("Erro na importação: " + error.message);
                setImportStatus(`Erro: ${error.message}`);
            } finally {
                setImporting(false);
            }
        };
        input.click();
    }

    const isCompanyName = (name: string) => {
        if (!name) return false;
        const lower = name.toLowerCase();
        const markers = [
            "lda", "s.a.", "limitada", "group", "holding", "sa ", " inc ", " corp ", " srl ",
            "mozambique", "moçambique", "invest", "serviços", "www.", ".com", ".co.mz", ".org",
            "industria", "indústria", "comércio", "comercio", "associação", "sociedade", "banco", "servicos",
            "cooperativa", "agro", "fazenda", "plantations", "trading"
        ];
        // Check for common company suffixes or markers
        if (markers.some(m => lower.includes(m))) return true;
        // Check for Buzi-Sofala style (likely companies) or names with " - "
        if (name.includes("-") && name.split("-").length > 1 && name.split("-")[0].length > 3) {
            // If it's something like "Buzi-Sofala" it's likely a company
            if (name.match(/^[A-Z][a-z]+-[A-Z][a-z]+$/)) return true;
        }
        return false;
    };

    const columns = [
        {
            header: "Nome",
            key: "name",
            render: (val: string, row: Contact) => {
                const isCompany = isCompanyName(val) || !!row.company_id;
                const companyName = row.company?.name;
                return (
                    <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                            {row.company?.logo_url ? (
                                <img src={row.company.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : isCompany ? (
                                <Building2 className="w-4 h-4 text-slate-300" />
                            ) : (
                                <Users className="w-4 h-4 text-slate-300" />
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-slate-800 truncate text-[13px]">{val || "–"}</span>
                            {companyName && (
                                <span className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-wider">
                                    {companyName}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Cargo",
            key: "role",
            render: (val: string) => val ? (
                <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider bg-slate-100/50 px-2 py-0.5 rounded-md inline-block max-w-[150px] truncate">
                    {val}
                </span>
            ) : <span className="text-slate-300 text-xs">—</span>
        },
        {
            header: "Email",
            key: "email",
            render: (val: string) => val ? (
                <div className="flex items-center gap-2 group/email min-w-[180px]">
                    <span className="text-slate-600 font-medium">{val}</span>
                    <button
                        onClick={() => navigator.clipboard.writeText(val)}
                        className="opacity-0 group-hover/email:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded text-slate-400"
                        title="Copiar email"
                    >
                        <CopyIcon className="w-3 h-3" />
                    </button>
                </div>
            ) : <span className="text-slate-300 text-xs">—</span>
        },
        {
            header: "Contacto",
            key: "phone",
            render: (val: string, row: Contact) => {
                const phone = val || row.whatsapp;
                return phone ? (
                    <div className="flex items-center gap-3 group/phone min-w-[140px]">
                        <span className="text-slate-800 font-black text-[13px]">{phone}</span>
                        <div className="flex items-center gap-1">
                            <a
                                href={`tel:${phone.replace(/\s/g, '')}`}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400"
                                title="Ligar"
                            >
                                <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-slate-100 rounded text-emerald-500"
                                title="Enviar WhatsApp"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            </a>
                        </div>
                    </div>
                ) : <span className="text-slate-300 text-xs">—</span>;
            }
        }
    ];

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => {
        // Criterion 1: Priority for contacts with phone/whatsapp
        const aHasPhone = !!(a.phone || a.whatsapp);
        const bHasPhone = !!(b.phone || b.whatsapp);
        if (aHasPhone !== bHasPhone) return aHasPhone ? -1 : 1;

        // Criterion 2: Verified status
        if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;

        // Criterion 3: Alphabetical order
        return (a.name || "").localeCompare(b.name || "");
    });

    async function handleScrape() {
        setImporting(true);
        setImportStatus("A iniciar recolha automática de contactos...");
        try {
            const res = await fetch('/api/scrape-contacts');
            const data = await res.json();
            if (data.success) {
                setImportStatus(`Sucesso! ${data.count} novos contactos encontrados.`);
                fetchContacts();
            } else {
                setImportStatus(`Erro: ${data.error}`);
            }
        } catch (e) {
            setImportStatus("Erro na ligação ao servidor.");
        } finally {
            setImporting(false);
        }
    }

    // Barra partilhada suprimida nesta página — o Sair vive na mesma linha
    // dos botões de gestão abaixo (sempre no fim), não numa barra à parte.
    useAdminTopBar("");

    return (
        <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-0 pb-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight m-0 p-0 leading-none">Gestão de Contactos</h1>
                    <span className="text-slate-400 text-sm font-medium mt-1">({filteredContacts.length})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500/20 transition-all outline-none w-48 md:w-64"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleScrape}
                        className="border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 gap-2 text-xs font-bold rounded-[8px] h-8 px-3 transition-all"
                        disabled={importing}
                    >
                        <Globe className="w-4 h-4" />
                        Importar de Websites
                    </Button>
                    <button
                        type="button"
                        onClick={() => { resetForm(); setEditingContact(null); setShowModal(true); }}
                        className={TOPBAR_NEW_BUTTON_CLASS}
                    >
                        <Plus className="w-4 h-4" />
                        Novo
                    </button>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </div>

            {importStatus && (
                <div className={`p-4 rounded-lg text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${importStatus.includes("Erro") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                    
                    {importStatus}
                </div>
            )}

            <div className="mt-[25px]">
                <AdminDataTable
                    title="Contactos"
                    data={filteredContacts}
                    columns={columns}
                    loading={loading}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onSelectRow={(id, selected) => {
                        if (selected) setSelectedIds(prev => [...prev, id]);
                        else setSelectedIds(prev => prev.filter(i => i !== id));
                    }}
                    onExport={handleExport}
                    onImport={handleManualImport}
                    onPrint={() => window.print()}
                    pageSize={100}
                    hideHeader={true}
                    selectedIds={selectedIds}
                    onSelectAll={(all) => {
                        if (all) {
                            const allIds = filteredContacts.map(c => c.id);
                            setSelectedIds(allIds);
                        } else {
                            setSelectedIds([]);
                        }
                    }}
                    bulkActions={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleBulkDelete}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                                title="Eliminar seleccionados"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    }
                    customActions={(row) => (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const newStatus = !row.is_verified;
                                    await supabase.from('contacts').update({ is_verified: newStatus }).eq('id', row.id);
                                    fetchContacts();
                                }}
                                className={`size-7 rounded flex items-center justify-center transition-all ${row.is_verified
                                    ? 'text-orange-500 hover:bg-orange-50'
                                    : 'text-slate-300 hover:bg-slate-50'
                                    }`}
                                title={row.is_verified ? "Remover dos favoritos" : "Marcar como favorito"}
                            >
                                <Star className={`w-3.5 h-3.5 ${row.is_verified ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    )}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900">
                                {editingContact ? "Editar Contacto" : "Novo Contacto"}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Company */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Empresa</label>
                                <select
                                    value={formData.company_id}
                                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                >
                                    <option value="">Selecionar empresa...</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Name & Role */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Nome</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                        placeholder="Nome do contacto"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Cargo</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                        placeholder="Ex: Director Comercial"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="email@empresa.com"
                                />
                            </div>

                            {/* Phones */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Telefone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                        placeholder="+258 84 000 0000"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                                        placeholder="+258 84 000 0000"
                                    />
                                </div>
                            </div>

                            {/* Source */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Origem</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="manual">Manual</option>
                                    <option value="website">Website</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="referral">Referência</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm h-20 resize-none"
                                    placeholder="Notas adicionais..."
                                />
                            </div>

                            {/* Verified */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_verified}
                                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Contacto verificado</span>
                            </label>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave}>
                                {editingContact ? "Guardar" : "Criar Contacto"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Contacto"
                description={`Tem a certeza que deseja eliminar o contacto "${contactToDelete?.name}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Eliminar"
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title="Eliminar em Massa"
                description={`Tem a certeza que deseja eliminar ${selectedIds.length} contactos? Esta ação não pode ser desfeita.`}
                confirmLabel="Eliminar Todos"
                variant="destructive"
            />
        </div>
    );
}
