"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Clock, ThumbsUp, Share2,
    ArrowRight, Facebook, Twitter, Linkedin,
    ChevronLeft, ChevronRight, Calendar, User, Bookmark,
    Newspaper, Tag, MessageCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { WeatherSidebar } from "@/components/WeatherSidebar";
import { NewsletterCard } from "@/components/NewsletterCard";

// DEMO FALLBACK DATA
const FALLBACK_ARTICLES_DATA = [
    {
        id: 'a1',
        title: "Impacto do Clima na Produção de Milho no Corredor da Beira",
        slug: "impacto-clima-milho-beira",
        date: "2024-01-10",
        type: "article",
        image_url: "https://images.unsplash.com/photo-1507842217121-9e871299ee18?q=80&w=800",
        subtitle: "Estudo analítico sobre as variações pluviométricas e seu efeito no rendimento das culturas.",
        content: "<p>Com as mudanças climáticas a afetarem cada vez mais a produção agrícola em Moçambique, este estudo foca-se no Corredor da Beira.</p><h2>Metodologia</h2><p>Foram analisados dados de 10 anos...</p>"
    },
    {
        id: 'a2',
        title: "Estudo sobre a Eficácia do Biocarvão em Solos Arenosos",
        slug: "estudo-biocarvao-solos-arenosos",
        date: "2023-11-20",
        type: "article",
        image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800",
        subtitle: "Investigação sobre a retenção de nutrientes e melhoria da estrutura do solo com uso de biochar.",
        content: "<p>O biocarvão tem se mostrado uma solução promissora para solos arenosos, comuns em várias regiões costeiras.</p>"
    },
    {
        id: 'a3',
        title: "Diversidade Genética do Embondeiro na Região Sul",
        slug: "diversidade-genetica-embondeiro-sul",
        date: "2023-09-05",
        type: "article",
        image_url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800",
        subtitle: "Mapeamento genético e conservação de uma das espécies mais icónicas de Moçambique.",
        content: "<p>O embondeiro (Adansonia digitata) é vital para as comunidades locais.</p>"
    }
];

export default function ArticleReadingPage() {
    const supabase = createClient();
    const params = useParams();
    const slug = params?.slug as string;

    const [article, setArticle] = useState<any>(null);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = article?.title || '';

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
            color: 'hover:bg-green-500',
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
        },
        { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'hover:bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
        { name: 'Twitter', icon: <Twitter className="w-4 h-4" />, color: 'hover:bg-sky-500', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}` },
        { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'hover:bg-blue-700', url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}` },
    ];

    useEffect(() => {
        const fetchArticleData = async () => {
            if (!slug) return;

            setLoading(true);
            try {
                // Fetch main article
                const { data: articleData, error: articleError } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if ((articleError && articleError.code !== 'PGRST116') || (!articleData && !articleError)) {
                    // Real error, not just 'not-found'
                    console.error("Supabase Error:", articleError);
                }

                if (articleData) {
                    setArticle(articleData);
                } else {
                    // Check fallback
                    const fallbackItem = FALLBACK_ARTICLES_DATA.find(a => a.slug === slug);
                    if (fallbackItem) {
                        setArticle(fallbackItem);
                    } else {
                        // Really not found
                        throw new Error("Article not found");
                    }
                }

                // Attempt to filter by same category if available
                let recQuery = supabase
                    .from('articles')
                    .select('*')
                    .neq('slug', slug)
                    .limit(20);

                if (articleData?.type) {
                    recQuery = recQuery.eq('type', articleData.type);
                }

                let { data: recData } = await recQuery;

                // Fallback: If not enough related articles, fetch generic ones
                if (!recData || recData.length < 4) {
                    const { data: fallbackData } = await supabase
                        .from('articles')
                        .select('*')
                        .neq('slug', slug)
                        .limit(10);

                    if (fallbackData) {
                        // Merge and remove duplicates by ID
                        const currentIds = new Set(recData?.map((a: any) => a.id) || []);
                        const newItems = fallbackData.filter((a: any) => !currentIds.has(a.id));
                        recData = [...(recData || []), ...newItems];
                    }
                }

                // Client-side shuffle for randomness
                const shuffled = recData ? recData.sort(() => 0.5 - Math.random()) : [];
                setRecommended(shuffled.slice(0, 4));
            } catch (error) {
                console.error("Error fetching article:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticleData();
    }, [slug]);

    if (loading && !article) {
        return <div className="min-h-screen bg-background" />;
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-black text-slate-800">Artigo não encontrado</h2>
                    <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
                        <ChevronLeft className="w-4 h-4" /> Voltar para a Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background selection:bg-emerald-100 selection:text-emerald-900">
            <PageHeader
                title={article.type || "Notícia"}
                icon={Newspaper}
                backgroundImage={
                    (article.title?.toLowerCase().includes("brasil") && article.title?.toLowerCase().includes("africa"))
                        ? "/images/Prototipo/brasilafrica.jpg"
                        : article.image_url || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop"
                }
                breadcrumbs={
                    article.type === 'document' ? [
                        { label: "Início", href: "/" },
                        { label: "Repositório", href: "/repositorio" },
                        { label: "Documentos", href: "/documentos" },
                        { label: article.type || "Documento", href: undefined }
                    ] : [
                        { label: "Início", href: "/" },
                        { label: "Blog", href: "/blog" },
                        { label: article.type || "Notícia", href: undefined }
                    ]
                }
            />

            <main className="container-site py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-[15px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                            <div className="p-8 md:p-12">
                                {/* Dot Category Tag */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/20 mb-6">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Artigo</span>
                                </div>

                                {/* Title */}
                                <h1 className="font-sans text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-4 tracking-tight">
                                    {article.title}
                                </h1>

                                {/* Metadata below Title */}
                                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10 pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-[#f97316]" />
                                        <span>{new Date(article.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ')}</span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-[#f97316]" />
                                        <span>5 min leitura</span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowShareMenu(!showShareMenu)}
                                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span>Partilhar</span>
                                        </button>

                                        {showShareMenu && (
                                            <div className="absolute left-0 top-full mt-2 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-50 flex gap-1 animate-in fade-in slide-in-from-top-2">
                                                {shareOptions.map((opt: any) => (
                                                    <a
                                                        key={opt.name}
                                                        href={opt.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${opt.color} hover:text-white text-slate-400`}
                                                        title={opt.name}
                                                    >
                                                        {opt.icon}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="article-content prose prose-slate max-w-none prose-p:text-[17px] prose-p:leading-[1.7] prose-p:text-slate-500 prose-headings:text-slate-800 prose-headings:font-black prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-blockquote:border-l-4 prose-blockquote:border-[#f97316] prose-blockquote:bg-orange-50/30 prose-blockquote:p-6 prose-blockquote:rounded-r-[10px] prose-blockquote:italic prose-blockquote:text-lg prose-strong:text-slate-700">
                                    <div dangerouslySetInnerHTML={{ __html: article.content || article.subtitle }} />
                                </div>
                            </div>
                        </div>

                        {/* Tags Section */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-12 flex flex-wrap gap-2.5">
                                {article.tags.map((tag: string, i: number) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center px-4 py-2 bg-white text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-[7px] border border-slate-100 shadow-sm"
                                    >
                                        <Tag className="w-3 h-3 mr-2 text-slate-300" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Interaction Footer */}
                        <div className="mt-12 pt-12 border-t border-slate-200">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                                <button className="flex items-center gap-3 group font-bold text-slate-600">
                                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-all border border-slate-200/50">
                                        <ThumbsUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 uppercase tracking-widest">Este artigo foi útil?</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mr-2">Siga-nos</p>
                                    {[Facebook, Twitter, Linkedin].map((Icon: any, i: any) => (
                                        <button key={i} className="size-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#f97316] hover:border-[#f97316] transition-all">
                                            <Icon className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations Section */}
                            <div className="pt-12 border-t border-slate-200">
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    Continue a ler <span className="flex-1 h-px bg-slate-100"></span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {recommended.map((item: any, i: any) => {
                                        const isSpecial = i < 2; // Make 첫 two cards special
                                        if (isSpecial) {
                                            return (
                                                <Link key={i} href={`/artigos/${item.slug}`} className="relative h-[220px] rounded-xl overflow-hidden group shadow-lg border border-slate-200">
                                                    <Image
                                                        src={item.image_url || [
                                                            "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
                                                            "https://images.unsplash.com/photo-1592982537447-7440770cbfc9",
                                                            "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
                                                            "https://images.unsplash.com/photo-1625246333195-58197bd47d26"
                                                        ][i % 4] + "?auto=format&fit=crop&q=80&w=600"}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end space-y-1">
                                                        <div className="inline-flex">
                                                            <span className="text-[9px] font-black bg-white text-emerald-700 px-2 py-0.5 rounded-[4px] uppercase tracking-widest shadow-sm border border-emerald-500/10">
                                                                {item.type || "Artigo"}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-base leading-tight text-white group-hover:text-[#f97316] transition-colors line-clamp-2">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-[11px] text-emerald-50/70 leading-relaxed line-clamp-2 font-medium">
                                                            {item.subtitle || "Abra este artigo e explore as novidades deste tema importante para o agronegócio."}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        }
                                        return (
                                            <Link key={i} href={`/artigos/${item.slug}`} className="flex gap-4 bg-white rounded-xl border border-slate-200 hover:border-[#f97316] transition-all group overflow-hidden">
                                                <div className="w-[120px] shrink-0 bg-slate-100 relative">
                                                    <Image
                                                        src={item.image_url || [
                                                            "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
                                                            "https://images.unsplash.com/photo-1592982537447-7440770cbfc9",
                                                            "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
                                                            "https://images.unsplash.com/photo-1625246333195-58197bd47d26"
                                                        ][i % 4] + "?auto=format&fit=crop&q=80&w=200"}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="flex-1 py-4 pr-4 space-y-2">
                                                    <div className="inline-flex">
                                                        <span className="text-[9px] font-black bg-white text-emerald-600 px-2 py-0.5 rounded-[4px] uppercase tracking-widest border border-slate-100 shadow-sm">
                                                            {item.type || "Artigo"}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-sm leading-snug text-slate-700 group-hover:text-[#f97316] transition-colors line-clamp-2">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                                        {item.subtitle || "Leia mais sobre este tópico importante para o desenvolvimento agrícola."}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-3 space-y-5 sticky top-32">
                        {/* 1. Categorias (Back in card) */}
                        <div className="bg-white rounded-[15px] border border-slate-100 shadow-xl p-5">
                            <div className="mb-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                    Categorias <span className="flex-1 h-px bg-slate-100"></span>
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {["Técnico", "Mercado", "Comunidade", "Institucional"].map((cat: any, i: any) => (
                                    <Link
                                        key={i}
                                        href={`/blog?cat=${cat}`}
                                        className="flex items-center gap-3 py-2 group transition-all duration-300 hover:translate-x-2"
                                    >
                                        <span className="size-1.5 rounded-full bg-slate-300 group-hover:bg-[#f97316] transition-colors"></span>
                                        <span className="text-[15px] font-bold text-slate-600 group-hover:text-[#f97316] transition-colors">
                                            {cat}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* 2. Clima */}
                        <WeatherSidebar />

                        {/* 3. Newsletter */}
                        <NewsletterCard />

                        {/* 4. Espaço Publicitário */}
                        <div className="relative aspect-[4/5] rounded-[15px] overflow-hidden group shadow-xl border border-emerald-500/20 bg-emerald-600 p-5">
                            <div className="absolute top-0 right-0 size-32 bg-emerald-400/20 blur-3xl rounded-full -mr-16 -mt-16"></div>

                            <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-2">Publicidade</p>
                                <h4 className="text-white font-black text-xl mb-6 leading-tight">Sua marca aqui em destaque no blog</h4>
                                <Link href="/contactos">
                                    <button className="bg-white text-emerald-700 px-8 py-4 rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all font-bold shadow-lg">Anunciar Agora</button>
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Reading Progress Logic Script (Inline for simplicity in this example) */}
            <script dangerouslySetInnerHTML={{
                __html: `
                window.onscroll = function() {
                    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    let scrolled = (winScroll / height) * 100;
                    document.getElementById("reading-progress").style.width = scrolled + "%";
                };
            ` }} />
        </div>
    );
}
