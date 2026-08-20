import { NextResponse } from 'next/server';

// Proxy ao DOAJ (Directory of Open Access Journals) — API pública, sem
// chave necessária para pesquisar (só editoras precisam de chave).
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '10';

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    try {
        const apiUrl = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=${limit}`;
        const response = await fetch(apiUrl, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch from DOAJ' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('DOAJ proxy error:', error);
        return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
    }
}
