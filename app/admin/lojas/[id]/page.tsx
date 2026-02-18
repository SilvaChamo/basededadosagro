"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CompanyEditor } from "@/components/admin/CompanyEditor";
import { Loader2, Store, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditStorePage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [store, setStore] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error("Error fetching store:", error);
                    toast.error("Erro ao carregar loja.");
                    router.push('/admin/lojas');
                } else {
                    // Map company data to store format
                    const storeData = {
                        ...data,
                        status: data?.is_active ? 'Aberto' : 'Fechado'
                    };
                    setStore(storeData);
                }
            } catch (err) {
                console.error("Exception in fetchStore:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStore();
    }, [id, router, supabase]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!store) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/admin/lojas" className="hover:text-orange-500 transition-colors">Lojas</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-slate-900 font-bold">Editar Loja</span>
                </div>

                <Link
                    href="/admin/lojas/novo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-3 h-3" />
                    Adicionar Loja
                </Link>
            </div>

            <CompanyEditor initialData={store} defaultType="Loja" />
        </div>
    );
}
