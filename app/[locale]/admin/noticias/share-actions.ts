"use server";

import { createClient } from "@/utils/supabase/server";

export async function shareToFacebook(articleId: string) {
    const supabase = await createClient();

    // 1. Get article data
    const { data: article, error: articleErr } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

    if (articleErr || !article) throw new Error("Artigo não encontrado");

    // 2. Get Integration data
    const { data: integration, error: intErr } = await supabase
        .from('integrations')
        .select('*')
        .eq('provider', 'facebook')
        .eq('is_active', true)
        .single();

    if (intErr || !integration) return { success: false, message: "Integração Facebook não configurada ou inactiva" };

    const { page_id, access_token } = integration.credentials;
    if (!page_id || !access_token) return { success: false, message: "Credenciais do Facebook incompletas" };

    // 3. Post to Facebook
    const postUrl = `https://graph.facebook.com/${page_id}/feed`;
    const message = `${article.title}\n\n${article.subtitle || ''}\n\nLeia mais em: https://basededadosagro.com/noticia/${article.slug}`;

    try {
        const response = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                link: `https://basededadosagro.com/noticia/${article.slug}`,
                access_token
            })
        });

        const result = await response.json();

        if (result.error) {
            console.error("Facebook API Error:", result.error);
            return { success: false, message: result.error.message };
        }

        // 4. Update article share status
        await supabase
            .from('articles')
            .update({ shared_on_facebook_at: new Date().toISOString() })
            .eq('id', articleId);

        return { success: true, id: result.id };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function shareToLinkedin(articleId: string) {
    const supabase = await createClient();

    // 1. Get article data
    const { data: article, error: articleErr } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

    if (articleErr || !article) throw new Error("Artigo não encontrado");

    // 2. Get Integration data
    const { data: integration, error: intErr } = await supabase
        .from('integrations')
        .select('*')
        .eq('provider', 'linkedin')
        .eq('is_active', true)
        .single();

    if (intErr || !integration) return { success: false, message: "Integração LinkedIn não configurada ou inactiva" };

    const { person_id, access_token } = integration.credentials;
    if (!person_id || !access_token) return { success: false, message: "Credenciais do LinkedIn incompletas" };

    // 3. Post to LinkedIn
    const postUrl = `https://api.linkedin.com/v2/ugcPosts`;
    const commentary = `${article.title}\n\n${article.subtitle || ''}\n\nLeia mais em: https://basededadosagro.com/noticia/${article.slug}`;

    const body = {
        author: `urn:li:person:${person_id}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: commentary },
                shareMediaCategory: "ARTICLE",
                media: [{
                    status: "READY",
                    description: { text: article.subtitle || article.title },
                    originalUrl: `https://basededadosagro.com/noticia/${article.slug}`,
                    title: { text: article.title }
                }]
            }
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    };

    try {
        const response = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("LinkedIn API Error:", errorData);
            return { success: false, message: errorData.message || "Erro desconhecido no LinkedIn" };
        }

        const result = await response.json();

        // 4. Update article share status
        await supabase
            .from('articles')
            .update({ shared_on_linkedin_at: new Date().toISOString() })
            .eq('id', articleId);

        return { success: true, id: result.id };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
