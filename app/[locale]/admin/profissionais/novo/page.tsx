"use client";

import { ProfessionalRegistrationForm } from "@/components/ProfessionalRegistrationForm";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";

export default function NewProfessionalPage() {
    useAdminTopBar("");
    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-2xl font-black text-slate-800 mb-6 px-6">Novo Profissional</h1>
            <ProfessionalRegistrationForm isAdmin={true} />
        </div>
    );
}
