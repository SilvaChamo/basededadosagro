"use client";

import { ProductEditor } from "@/components/admin/ProductEditor";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
    const params = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;

            const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (product) setData(product);
            setLoading(false);
        };

        fetchData();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-[calc(100vh-80px)] p-6">
            <ProductEditor initialData={data} />
        </div>
    );
}
