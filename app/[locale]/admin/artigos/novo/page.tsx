import { NewsEditor } from "@/components/admin/NewsEditor";

export default function NewArticlePage() {
    return (
        <div className="max-w-7xl mx-auto py-8">
            <NewsEditor isNew={true} />
        </div>
    );
}
