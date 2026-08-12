"use client";

import { useEffect, useState } from "react";

export default function DebugEnvPage() {
    const [env, setEnv] = useState<any>({});

    useEffect(() => {
        setEnv({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present (Hidden)' : 'Missing',
            NODE_ENV: process.env.NODE_ENV,
        });
    }, []);

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Debug Environment Variables</h1>
            <pre className="bg-slate-100 p-4 rounded">
                {JSON.stringify(env, null, 2)}
            </pre>
        </div>
    );
}
