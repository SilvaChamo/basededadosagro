import { NextResponse } from 'next/server';

// Proxy ao PubMed/NCBI (E-utilities) — API pública, sem chave necessária
// (limite de 3 pedidos/segundo sem chave; ver NCBI_API_KEY para subir a 10).
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '10';

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const apiKey = process.env.NCBI_API_KEY;
    const keyParam = apiKey ? `&api_key=${apiKey}` : '';

    try {
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${limit}${keyParam}`;
        const searchResponse = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });

        if (!searchResponse.ok) {
            return NextResponse.json({ error: 'Failed to search PubMed' }, { status: searchResponse.status });
        }

        const searchData = await searchResponse.json();
        const ids: string[] = searchData?.esearchresult?.idlist || [];

        if (ids.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json${keyParam}`;
        const summaryResponse = await fetch(summaryUrl, { signal: AbortSignal.timeout(8000) });

        if (!summaryResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch PubMed summaries' }, { status: summaryResponse.status });
        }

        const summaryData = await summaryResponse.json();
        const result = summaryData?.result || {};

        const papers = ids
            .filter((id) => result[id])
            .map((id) => {
                const item = result[id];
                return {
                    pmid: id,
                    title: item.title,
                    authors: (item.authors || []).map((a: any) => ({ name: a.name })),
                    source: item.fulljournalname || item.source,
                    pubdate: item.pubdate,
                };
            });

        return NextResponse.json({ data: papers });
    } catch (error: any) {
        console.error('PubMed proxy error:', error);
        return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
    }
}
