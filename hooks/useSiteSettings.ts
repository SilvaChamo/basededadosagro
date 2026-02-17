import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useSiteSettings() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) {
                console.error("Error fetching settings:", error);
            } else {
                const settingsMap: Record<string, any> = {};
                data?.forEach((item: any) => {
                    settingsMap[item.key] = item.value;
                });
                setSettings(settingsMap);
            }
            setLoading(false);
        };

        fetchSettings();

        // Optional: Realtime subscription could be added here
    }, []);

    return { settings, loading };
}
