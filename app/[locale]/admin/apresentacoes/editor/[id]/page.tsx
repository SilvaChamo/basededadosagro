"use client";

import { use } from "react";
import { PresentationEditorComponent } from "@/components/admin/PresentationEditorComponent";

export default function PresentationEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <PresentationEditorComponent id={id} backPath="/admin/apresentacoes" />
    );
}
