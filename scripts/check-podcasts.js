const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    const { data, error } = await supabase.from('podcasts').select('id, title, is_active, is_featured').limit(10);
    if (error) console.log('ERROR:', JSON.stringify(error));
    else if (!data || data.length === 0) console.log('NO PODCASTS FOUND - table is empty!');
    else console.log('PODCASTS:', JSON.stringify(data, null, 2));
    process.exit(0);
})();
setTimeout(() => { process.exit(1); }, 8000);
