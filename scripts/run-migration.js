const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

console.log('Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // First check if column already exists
    const { data, error } = await supabase
        .from('podcasts')
        .select('is_active')
        .limit(1);

    if (error) {
        console.log('Column is_active does NOT exist yet. Error:', error.message);
        console.log('\n⚠️  The Supabase JS client cannot run raw ALTER TABLE statements.');
        console.log('You need to run this SQL in the Supabase Dashboard > SQL Editor:\n');
        console.log('ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;');
        console.log('UPDATE public.podcasts SET is_active = TRUE WHERE is_active IS NULL;\n');
    } else {
        console.log('✅ Column is_active already exists! No migration needed.');
        console.log('Current data:', JSON.stringify(data, null, 2));
    }
}

run().catch(err => {
    console.error('Script error:', err.message);
    process.exit(1);
});
