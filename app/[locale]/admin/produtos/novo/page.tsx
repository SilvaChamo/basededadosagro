"use client";

import { ProductEditor } from "@/components/admin/ProductEditor";

export default function NewProductPage() {
    return (
        <div className="h-[calc(100vh-80px)] p-6">
            <ProductEditor isNew={true} />
        </div>
    );
}
