'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { TopicListItem } from '@/components/forum/TopicListItem';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { Database } from '@/lib/database.types';

export default function CategoryPage() {
    const { categorySlug } = useParams();
    const router = useRouter();
    const [category, setCategory] = useState<Database['public']['Tables']['forum_categories']['Row'] | null>(null);
    const [topics, setTopics] = useState<Database['public']['Tables']['forum_topics']['Row'][]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function loadCategoryAndTopics() {
            // Load category
            const { data: catData, error: catError } = await supabase
                .from('forum_categories')
                .select('*')
                .eq('slug', categorySlug)
                .single();

            if (catError || !catData) {
                router.push('/forum');
                return;
            }

            setCategory(catData);

            // Load topics
            const { data: topData, error: topError } = await supabase
                .from('forum_topics')
                .select('*')
                .eq('category_id', catData.id)
                .order('created_at', { ascending: false });

            if (!topError && topData) {
                setTopics(topData);
            }
            setLoading(false);
        }

        loadCategoryAndTopics();
    }, [categorySlug, supabase, router]);

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-20">
            <PageHeader
                title={category?.name || 'Carregando...'}
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Fórum", href: "/forum" },
                    { label: category?.name || 'Categoria' }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b pb-2">Fóruns</h2>
                            <div className="flex flex-col gap-2">
                                <Link href="/forum" className="text-sm text-emerald-600 hover:underline">← Voltar à lista</Link>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b pb-2">Pesquisa</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <Button className="bg-emerald-600 hover:bg-emerald-700 h-8 px-4 rounded-sm">Pesquisar</Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{category?.name}</h2>
                            <Button
                                onClick={() => router.push(`/forum/novo-topico?category=${category?.id}`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm"
                            >
                                <Plus size={18} className="mr-2" /> Novo Tópico
                            </Button>
                        </div>

                        <div className="bg-[#f9f9f9] dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-3 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                                <div className="col-span-6">Tópico</div>
                                <div className="col-span-2 text-center">Vozes</div>
                                <div className="col-span-2 text-center">Respostas</div>
                                <div className="col-span-2">Último Post</div>
                            </div>

                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {topics.length === 0 ? (
                                    <div className="p-12 text-center bg-white dark:bg-zinc-900">
                                        <p className="text-zinc-500">Ainda não há tópicos nesta categoria.</p>
                                    </div>
                                ) : (
                                    topics.map((topic) => (
                                        <div key={topic.id} className="grid grid-cols-12 gap-4 p-4 items-center bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="col-span-6">
                                                <Link href={`/forum/topic/${topic.id}`} className="text-base font-medium text-emerald-600 hover:underline block">
                                                    {topic.title}
                                                </Link>
                                                <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                                                    <span>Iniciado por:</span>
                                                    <span className="text-zinc-500">Participante</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                                1
                                            </div>
                                            <div className="col-span-2 text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                                0
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-[11px] text-zinc-500 truncate">
                                                    Haja algum tempo
                                                </div>
                                                <div className="text-[10px] text-zinc-400 truncate">
                                                    por Usuário
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
