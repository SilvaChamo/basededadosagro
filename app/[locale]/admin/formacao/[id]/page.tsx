"use client";

import { TrainingEditor } from "@/components/admin/TrainingEditor";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function EditTrainingPage() {
    const params = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;

            const { data: training } = await supabase
                .from('trainings')
                .select('*')
                .eq('id', params.id)
                .single();

            if (training) setData(training);
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
        <div className="w-full max-w-none mx-auto py-8">
            <TrainingEditor initialData={data} />
        </div>
    );
}
