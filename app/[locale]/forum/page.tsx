'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ForumCategoryCard } from '@/components/forum/ForumCategoryCard';
import { PageHeader } from '@/components/PageHeader';
import { CommunityBanner } from '@/components/CommunityBanner';
import { Database } from '@/lib/database.types';

export default function ForumPage() {
    const [categories, setCategories] = useState<Database['public']['Tables']['forum_categories']['Row'][]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function loadCategories() {
            const { data, error } = await supabase
                .from('forum_categories')
                .select('*')
                .order('name');

            if (!error && data) {
                setCategories(data);
            }
            setLoading(false);
        }

        loadCategories();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <PageHeader
                title="Fórum de Debate"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Fórum" }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Forums List Style */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b pb-2">Fóruns</h2>
                            <div className="space-y-4">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center text-sm group">
                                        <Link href={`/forum/${cat.slug}`} className="text-emerald-600 hover:underline font-medium">
                                            {cat.name}
                                        </Link>
                                        <span className="text-zinc-400 group-hover:text-zinc-600">0</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 border-b pb-2">Visualizações</h2>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2 text-zinc-600 hover:text-emerald-600 cursor-pointer transition-colors">
                                    <span className="text-emerald-500 font-bold">★</span> Tópicos mais populares
                                </li>
                                <li className="flex items-center gap-2 text-zinc-600 hover:text-emerald-600 cursor-pointer transition-colors">
                                    <span className="text-emerald-500 font-bold">★</span> Tópicos sem respostas
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content - Categories Table Style */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#f9f9f9] dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                            <div className="grid grid-cols-12 gap-4 p-3 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                                <div className="col-span-10">Fórum</div>
                                <div className="col-span-2 text-center">Postagens</div>
                            </div>

                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="p-4 animate-pulse h-16 bg-white dark:bg-zinc-900"></div>
                                    ))
                                ) : (
                                    categories.map((category) => (
                                        <div key={category.id} className="grid grid-cols-12 gap-4 p-4 items-center bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="col-span-10">
                                                <Link href={`/forum/${category.slug}`} className="text-lg font-medium text-emerald-600 hover:underline">
                                                    {category.name}
                                                </Link>
                                                <p className="text-sm text-zinc-500 mt-1 line-clamp-1">
                                                    {category.description || 'Discussão aberta sobre este tema.'}
                                                </p>
                                            </div>
                                            <div className="col-span-2 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                0
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-12 p-8 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-900 text-center">
                            <h3 className="text-xl font-bold text-zinc-400 tracking-[0.2em]">BREVEMENTE!</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
