'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { Database } from '@/lib/database.types';

function NewTopicContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
            if (!user) {
                router.push('/auth/login?next=/forum/novo-topico');
            } else {
                setUser(user);
            }
        });
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('forum_topics')
            .insert([
                {
                    title,
                    content,
                    category_id: categoryId,
                    user_id: user.id,
                }
            ])
            .select()
            .single();

        if (!error && data) {
            router.push(`/forum/topic/${data.id}`);
        } else {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Novo Tópico"
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Fórum", href: "/forum" },
                    { label: "Novo Tópico" }
                ]}
            />

            <div className="max-w-3xl mx-auto px-4 py-12">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-zinc-600 hover:text-emerald-600 transition-colors mb-8"
                >
                    <ArrowLeft size={20} className="mr-2" /> Cancelar
                </Button>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-[8px] border border-zinc-200 dark:border-zinc-800 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 dark:text-white">Título do Tópico</label>
                        <Input
                            placeholder="O que quer discutir?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="rounded-[8px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-900 dark:text-white">Conteúdo</label>
                        <Textarea
                            placeholder="Descreva o seu tema detalhadamente..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            className="min-h-[200px] rounded-[8px]"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !title || !content}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] h-12"
                    >
                        {loading ? 'Publicando...' : (
                            <>
                                <Send size={20} className="mr-2" /> Publicar Tópico
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </>
    );
}

export default function NewTopicPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20">
            <Suspense fallback={
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
                </div>
            }>
                <NewTopicContent />
            </Suspense>
        </div>
    );
}
