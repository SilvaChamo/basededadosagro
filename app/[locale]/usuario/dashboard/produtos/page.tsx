"use client";

import { useState, useEffect } from "react";
import { Package, MapPin, Users, Lock, Search, ArrowLeft, ExternalLink, Building2, MapPin as MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradeModal } from "@/components/UpgradeModal";
import { toast } from "sonner";
import { PlanType } from "@/lib/plan-fields";
import { CompanyEditor } from "@/components/dashboard/CompanyEditor";

export default function MeuConteudoPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<"empresa" | "produtos" | "propriedades" | "conexoes">("empresa");
    const [user, setUser] = useState<User | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [productsThisMonth, setProductsThisMonth] = useState(0);
    const [upgradeModal, setUpgradeModal] = useState<{
        isOpen: boolean;
        fieldLabel: string;
        requiredPlan: PlanType;
    }>({
        isOpen: false,
        fieldLabel: "Novos Produtos",
        requiredPlan: "Premium"
    });

    // Plan permissions
    const {
        productLimit,
        canCreateNewProduct,
        remainingProducts,
        planDisplayName,
        plan,
        loading: planLoading
    } = usePlanPermissions();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    // State for Product Form
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [productForm, setProductForm] = useState({
        name: "",
        price: "",
        category: "",
        description: "",
        imageUrl: ""
    });

    // Partner Search State
    const [showPartnerSearch, setShowPartnerSearch] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch user products
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        if (user) fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        if (!user) return;

        // Fetch all products
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setProducts(data);

        // Count products created this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString());

        setProductsThisMonth(count || 0);

        // Also fetch company_id
        const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (companyData) setCompanyId(companyData.id);
    };

    const handleAddProductClick = () => {
        if (!canCreateNewProduct(productsThisMonth)) {
            setUpgradeModal({
                isOpen: true,
                fieldLabel: "Novos Produtos",
                requiredPlan: "Premium"
            });
            return;
        }
        setIsAddingProduct(true);
    };

    const handlePartnerSearch = async () => {
        // Only Paid Plans can search partners
        if (plan === 'Gratuito' || !plan) {
            setUpgradeModal({
                isOpen: true,
                fieldLabel: "Buscar Parceiros",
                requiredPlan: "Básico"
            });
            return;
        }

        setShowPartnerSearch(true);
        if (partners.length === 0) {
            fetchPartners();
        }
    };

    const fetchPartners = async () => {
        setLoadingPartners(true);
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .in('plan', ['Business Vendedor', 'Parceiro'])
                .order('name');

            if (data) setPartners(data);
        } catch (error) {
            toast.error("Erro ao buscar parceiros.");
        } finally {
            setLoadingPartners(false);
        }
    };

    const filteredPartners = partners.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.province?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];

        try {
            const fileName = `products/${user?.id}-${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('public-assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('public-assets')
                .getPublicUrl(fileName);

            setProductForm(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (error) {
            console.error(error);
            alert("Erro no upload da imagem");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!user || !productForm.name || !productForm.price) {
            alert("Preencha os campos obrigatórios");
            return;
        }

        const { error, data: newProduct } = await supabase.from('products').insert({
            user_id: user.id,
            name: productForm.name,
            price: productForm.price,
            category: productForm.category,
            description: productForm.description,
            image_url: productForm.imageUrl,
            company_id: companyId
        }).select().single();

        if (error) {
            alert("Erro ao salvar: " + error.message);
        } else {
            alert("Produto salvo com sucesso!");

            // Trigger SMS notification for company products
            try {
                // Fetch company location for better targeting
                const { data: compData } = await supabase
                    .from('companies')
                    .select('province')
                    .eq('id', companyId)
                    .single();

                fetch('/api/sms/notify-new-product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product: productForm.name,
                        price: productForm.price,
                        location: compData?.province || 'Sua localização',
                        type: 'company'
                    })
                });
            } catch (smsErr) {
                console.error("SMS trigger error:", smsErr);
            }

            setIsAddingProduct(false);
            setProductForm({ name: "", price: "", category: "", description: "", imageUrl: "" });
            fetchProducts();
        }
    };

    return (
        <div className="space-y-6">
            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={upgradeModal.isOpen}
                onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
                fieldLabel={upgradeModal.fieldLabel}
                requiredPlan={upgradeModal.requiredPlan}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-[900] tracking-tight text-[#3a3f47]">Meu Conteúdo</h2>
                    <p className="text-slate-500">Gerencie seus produtos, propriedades e conexões.</p>
                </div>
                {activeTab === "produtos" && (
                    <div className="flex items-center gap-3">
                        {/* Product limit badge */}
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-500">Limite mensal</p>
                            <p className="text-sm font-black text-slate-700">
                                {productsThisMonth}/{productLimit === Infinity ? '∞' : productLimit}
                            </p>
                        </div>
                        <Button
                            onClick={handleAddProductClick}
                            disabled={!canCreateNewProduct(productsThisMonth)}
                            className={`px-6 py-2 rounded-md font-bold shadow-md transition-all hover:scale-105 ${canCreateNewProduct(productsThisMonth)
                                ? 'bg-emerald-600 hover:bg-orange-500 text-white'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed hover:scale-100'
                                }`}
                        >
                            {canCreateNewProduct(productsThisMonth) ? '+ Novo Produto' : (
                                <span className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Limite Atingido
                                </span>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-slate-300 mb-8">
                <button
                    onClick={() => setActiveTab("empresa")}
                    className={`px-6 py-2 text-sm font-bold rounded-t-md transition-all border-t border-l border-r relative -mb-px ${activeTab === "empresa"
                        ? "text-orange-600 border-slate-300 border-b-transparent bg-white"
                        : "text-slate-500 border-transparent hover:text-orange-600"
                        }`}
                >
                    Minha Empresa
                </button>
                <button
                    onClick={() => setActiveTab("propriedades")}
                    className={`px-6 py-2 text-sm font-bold rounded-t-md transition-all border-t border-l border-r relative -mb-px ${activeTab === "propriedades"
                        ? "text-orange-600 border-slate-300 border-b-transparent bg-white"
                        : "text-slate-500 border-transparent hover:text-orange-600"
                        }`}
                >
                    Minhas Propriedades
                </button>
                <button
                    onClick={() => setActiveTab("produtos")}
                    className={`px-6 py-2 text-sm font-bold rounded-t-md transition-all border-t border-l border-r relative -mb-px ${activeTab === "produtos"
                        ? "text-orange-600 border-slate-300 border-b-transparent bg-white"
                        : "text-slate-500 border-transparent hover:text-orange-600"
                        }`}
                >
                    Meus Produtos
                </button>
                <button
                    onClick={() => setActiveTab("conexoes")}
                    className={`px-6 py-2 text-sm font-bold rounded-t-md transition-all border-t border-l border-r relative -mb-px ${activeTab === "conexoes"
                        ? "text-orange-600 border-slate-300 border-b-transparent bg-white"
                        : "text-slate-500 border-transparent hover:text-orange-600"
                        }`}
                >
                    Minhas Conexões
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === "empresa" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <CompanyEditor user={user} />
                    </div>
                )}

                {activeTab === "produtos" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isAddingProduct ? (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg max-w-2xl mx-auto">
                                <h3 className="font-bold text-xl mb-6">Novo Produto</h3>
                                <div className="space-y-4">
                                    <input
                                        className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold text-slate-600"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        placeholder="NOME DO PRODUTO: Ex: Milho Branco"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold text-slate-600"
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            placeholder="PREÇO (MT): Ex: 0.00"
                                        />
                                        <input
                                            className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold text-slate-600"
                                            value={productForm.category}
                                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                            placeholder="CATEGORIA: Ex: Grãos"
                                        />
                                    </div>
                                    <textarea
                                        className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg h-32 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold text-slate-600 leading-relaxed resize-none"
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        placeholder="DESCRIÇÃO: Detalhes, qualidade, origem do produto..."
                                    />
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-2 block">Imagem</label>
                                        <div className="flex items-center gap-4">
                                            {productForm.imageUrl && <img src={productForm.imageUrl} className="w-16 h-16 object-cover rounded shadow-sm" />}
                                            <input type="file" onChange={handleImageUpload} disabled={uploading} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                            {uploading && <span className="text-sm text-orange-500 animate-pulse">Enviando...</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancelar</Button>
                                        <Button onClick={handleSaveProduct} className="bg-emerald-600 text-white hover:bg-emerald-700">Salvar Produto</Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {products.length === 0 ? (
                                    <div className="border border-dashed border-slate-300 rounded-xl h-80 flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                                            <Package className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-lg text-slate-700">Você ainda não tem produtos</h3>
                                            <p className="text-sm max-w-xs mx-auto mt-1">Comece a adicionar seus produtos para que apareçam no mercado.</p>
                                        </div>
                                        <Button
                                            onClick={handleAddProductClick}
                                            variant="outline" className="mt-4 border-slate-300 hover:bg-white hover:text-orange-600 hover:border-orange-200"
                                        >
                                            {canCreateNewProduct(productsThisMonth) ? 'Adicionar Primeiro Produto' : 'Fazer Upgrade'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {products.map((p, i) => (
                                            <div key={i} className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="h-40 bg-slate-100 relative overflow-hidden">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-slate-300"><Package className="w-8 h-8" /></div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                                                        <button
                                                            onClick={async () => {
                                                                const newStatus = p.available === false ? true : false;
                                                                const { error } = await supabase.from('products').update({ available: newStatus }).eq('id', p.id);
                                                                if (!error) fetchProducts();
                                                            }}
                                                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${p.available !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                                                        >
                                                            {p.available !== false ? 'Em Stock' : 'Esgotado'}
                                                        </button>
                                                    </div>
                                                    <p className="text-orange-600 font-bold text-base">{p.price} MT</p>
                                                    <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === "propriedades" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="border border-dashed border-slate-300 rounded-xl h-80 flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
                            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg text-slate-700">Nenhuma propriedade cadastrada</h3>
                                <p className="text-sm max-w-xs mx-auto mt-1">Adicione suas fazendas, terrenos ou instalações.</p>
                            </div>
                            <Button variant="outline" className="mt-4 border-slate-300 hover:bg-white hover:text-orange-600 hover:border-orange-200">
                                Adicionar Propriedade
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === "conexoes" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {showPartnerSearch ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowPartnerSearch(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                                    </Button>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar por nome, categoria ou província..."
                                            className="pl-10 bg-white border-slate-200"
                                        />
                                    </div>
                                </div>

                                {loadingPartners ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                    </div>
                                ) : filteredPartners.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredPartners.map(partner => (
                                            <div key={partner.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg">
                                                        {partner.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {partner.is_featured && (
                                                        <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Destaque
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-800 truncate mb-1">{partner.name}</h4>
                                                <div className="space-y-1 mb-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Building2 className="w-3 h-3" />
                                                        <span className="truncate">{partner.category || "Sem Categoria"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <MapPinIcon className="w-3 h-3" />
                                                        <span className="truncate">{partner.province || "Moçambique"}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full h-8 text-xs font-bold bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200"
                                                    onClick={() => window.open(`/empresa/${partner.id}`, '_blank')}
                                                >
                                                    Ver Perfil <ExternalLink className="w-3 h-3 ml-2" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>Nenhum parceiro encontrado com esses termos.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border border-dashed border-slate-300 rounded-xl h-80 flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-slate-700">Sem conexões ativas</h3>
                                    <p className="text-sm max-w-xs mx-auto mt-1">Conecte-se com outros produtores e empresas da rede.</p>
                                </div>
                                <Button
                                    onClick={handlePartnerSearch}
                                    variant="outline"
                                    className="mt-4 border-slate-300 hover:bg-white hover:text-orange-600 hover:border-orange-200 gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Buscar Parceiros
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

