import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRegex = /(?:\+258|258)?[\s.-]?(?:8[2-7]|21|23|24|25|26|27|28|29)[\s.-]?\d{3}[\s.-]?\d{4}/g;

async function scrapeAll() {
    console.log("Starting bulk website sync...");

    const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name, website')
        .not('website', 'is', null)
        .neq('website', '');

    if (error) {
        console.error("Error fetching companies:", error);
        return;
    }

    console.log(`Found ${companies.length} companies with websites.`);

    for (const company of companies) {
        console.log(`\nProcessing ${company.name} (${company.website})...`);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(company.website, {
                headers: { 'User-Agent': 'Mozilla/5.0 (BaseDadosAgro Bot)' },
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();

            // 1. Extract Meta Description using Regex
            const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
                html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);

            if (metaMatch && metaMatch[1]) {
                const metaDesc = metaMatch[1];
                console.log(`Found description: ${metaDesc.substring(0, 50)}...`);
                await supabase.from('companies').update({
                    description: metaDesc.substring(0, 500),
                    bio: metaDesc
                }).eq('id', company.id);
            }

            // 2. Extract Contacts
            const emails = [...new Set(html.match(emailRegex) || [])].filter(e => !e.includes('example.com') && !e.includes('sentry') && !e.includes('webpack'));
            const phones = [...new Set(html.match(phoneRegex) || [])].map(p => p.replace(/[\s.-]/g, ''));

            console.log(`Found ${emails.length} emails and ${phones.length} phones.`);

            for (const email of emails.slice(0, 3)) {
                await supabase.from('contacts').upsert({
                    company_id: company.id,
                    name: `Contacto - ${company.name}`,
                    email: email,
                    phone: phones[0] || null,
                    whatsapp: phones[0] || null,
                    source: 'bulk_scrape',
                    role: 'Contacto Geral',
                    notes: `Sincronizado automaticamente de ${company.website}`,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'email' });
            }

        } catch (e) {
            console.error(`Failed to scrape ${company.name}: ${e.message}`);
        }
    }

    console.log("\nBulk website sync finished.");
}

await scrapeAll();
