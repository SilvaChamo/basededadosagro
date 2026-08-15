"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface NewsCategory {
    id: string;
    name: string;
    slug: string;
}

export function useNewsCategories() {
    const [categories, setCategories] = useState<NewsCategory[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("news_categories")
            .select("id, name, slug")
            .order("name")
            .then(({ data }: { data: NewsCategory[] | null }) => setCategories(data || []));
    }, []);

    return categories;
}
