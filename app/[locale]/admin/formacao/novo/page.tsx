"use client";

import { TrainingEditor } from "@/components/admin/TrainingEditor";

export default function NewTrainingPage() {
    return (
        <div className="w-full max-w-none mx-auto py-8">
            <TrainingEditor isNew={true} />
        </div>
    );
}
