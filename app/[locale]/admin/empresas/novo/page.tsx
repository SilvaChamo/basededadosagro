import { CompanyEditor } from "@/components/admin/CompanyEditor";

export default function NewCompanyPage() {
    return (
        <div className="w-full max-w-none mx-auto py-8">
            <CompanyEditor isNew />
        </div>
    );
}
