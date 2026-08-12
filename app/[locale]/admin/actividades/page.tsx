import { AdminHeader } from "@/components/admin/AdminHeader";

export default function ActivitiesPage() {
    return (
        <div className="space-y-6">
            <AdminHeader
                title="Gestão de Actividades"
                subtitle="Acompanhe as actividades recentes"
            />

            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-500">Módulo em desenvolvimento...</p>
            </div>
        </div>
    );
}
