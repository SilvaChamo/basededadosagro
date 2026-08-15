'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/lib/database.types';
import { Spinner } from "@/components/ui/spinner";

export default function TopicPage() {
    const { topicId } = useParams();
    const router = useRouter();
    const [topic, setTopic] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => setUser(user));

        async function loadTopicData() {
            // Load topic with category info
            const { data: topData, error: topError } = await supabase
                .from('forum_topics')
                .select(`
          *,
          forum_categories (name, slug)
        `)
                .eq('id', topicId)
                .single();

            if (topError || !topData) {
                router.push('/forum');
                return;
            }

            setTopic(topData);

            // Increment view count
            await supabase
                .from('forum_topics')
                .update({ views_count: (topData.views_count || 0) + 1 })
                .eq('id', topicId);

            // Load comments
            const { data: comData, error: comError } = await supabase
                .from('forum_comments')
                .select('*')
                .eq('topic_id', topicId)
                .order('created_at', { ascending: true });

            if (!comError && comData) {
                setComments(comData);
            }
            setLoading(false);
        }

        loadTopicData();
    }, [topicId, supabase, router]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSending(true);
        const { data, error } = await supabase
            .from('forum_comments')
            .insert([
                {
                    content: newComment,
                    topic_id: topicId,
                    user_id: user.id
                }
            ])
            .select()
            .single();

        if (!error && data) {
            setComments([...comments, data]);
            setNewComment('');
        }
        setSending(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20 flex items-center justify-center">
            <Spinner className="h-12 w-12" />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20">
            <PageHeader
                title={topic?.title}
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Fórum", href: "/forum" },
                    { label: topic?.forum_categories?.name || 'Categoria', href: `/forum/${topic?.forum_categories?.slug}` },
                    { label: "Tópico" }
                ]}
            />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/forum/${topic?.forum_categories?.slug}`)}
                    className="text-zinc-600 hover:text-emerald-600 transition-colors mb-8"
                >
                    <ArrowLeft size={20} className="mr-2" /> Voltar para {topic?.forum_categories?.name}
                </Button>

                {/* Topic Content */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[8px] border border-zinc-200 dark:border-zinc-800 mb-8">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-zinc-900 dark:text-white">Participante do Fórum</p>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                        {topic?.content}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        Comentários <span className="text-sm font-normal text-zinc-500">({comments.length})</span>
                    </h3>

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[8px] border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-400">
                                        <UserIcon size={18} />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white">Usuário</p>
                                            <span className="text-[10px] text-zinc-500">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* New Comment Form */}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="mt-12 bg-zinc-100 dark:bg-zinc-900/50 p-6 rounded-[8px] border border-zinc-200 dark:border-zinc-800">
                            <h4 className="font-bold mb-4">Deixe o seu comentário</h4>
                            <Textarea
                                placeholder="Partilhe a sua opinião ou tire uma dúvida..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="mb-4 rounded-[8px] min-h-[100px] bg-white dark:bg-zinc-900"
                                required
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={sending || !newComment.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px]"
                                >
                                    {sending ? 'Enviando...' : (
                                        <>
                                            <Send size={18} className="mr-2" /> Comentar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-12 p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[8px] border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
                            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Precisa estar autenticado para comentar.</p>
                            <Button
                                onClick={() => router.push(`/auth/login?next=/forum/topic/${topicId}`)}
                                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white rounded-[8px]"
                            >
                                Entrar para Comentar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
