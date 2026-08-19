import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') || '10';

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    try {
        const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,venue,year,url,abstract`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                // Add an API key here if you have one: 'x-api-key': 'YOUR_KEY'
            },
            // Sem chave de API, o Semantic Scholar limita/atrasa pedidos e pode
            // demorar dezenas de segundos a responder — limite para nunca
            // deixar este pedido pendurado indefinidamente.
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: 'Failed to fetch from Semantic Scholar', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
