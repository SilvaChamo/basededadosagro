
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function DesignSystem() {
    return (
        <div className="min-h-screen bg-background p-10 space-y-10">
            <div className="flex items-center gap-6 mb-8 border-b border-slate-200 pb-8">
                <img src="/logo_new.png" alt="Base Agro Data Logo" className="h-14 w-auto" />
                <div className="space-y-1">
                    <h1 className="text-[35px] font-black tracking-tight text-slate-800">Design System</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Ambiente de desenvolvimento e kit de padronização de componentes.
                    </p>
                </div>
            </div>

            <section className="space-y-6 bg-slate-50 p-8 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Aa</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Kit de Tipografia (Padrão 35px)</h2>
                </div>

                <div className="grid gap-8">
                    <div className="space-y-2">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">H1 - Título de Banner (Desktop)</p>
                        <h1 className="text-[35px] font-extrabold tracking-tight text-slate-800 leading-none mb-0">
                            Título Principal do Site
                        </h1>
                        <p className="text-[12px] text-emerald-600 font-bold">font-extrabold | 35px | tracking-tight | Sentence case</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">H2 - Título de Secção (Desktop)</p>
                        <h2 className="text-[35px] font-black tracking-tight text-slate-700 leading-none mb-0">
                            Título de Secção de Conteúdo
                        </h2>
                        <p className="text-[12px] text-emerald-600 font-bold">font-black | 35px | tracking-tight | text-slate-700</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">H3 - Subtítulo / Destaque</p>
                        <h3 className="text-[20px] font-normal text-slate-500 leading-relaxed mb-0">
                            Infra-estrutura que Impulsiona o Desenvolvimento do Sector Agrário
                        </h3>
                        <p className="text-[12px] text-emerald-600 font-bold">font-normal | 20px | leading-relaxed | text-slate-500</p>
                    </div>
                </div>
            </section>

            <section className="space-y-4 border-b pb-10">
                <h2 className="text-2xl font-semibold">Módulos & Páginas (Workspaces)</h2>
                <div className="flex flex-wrap gap-4">
                    <a href="/design-system/podcast" className="btn-primary">
                        AgroCast (Podcast)
                    </a>
                    <a href="/design-system/arquivo-produtos" className="btn-primary">
                        Arquivo de Produtos
                    </a>
                    <a href="/design-system/registo-simples" className="btn-primary">
                        Formulário de Cadastro
                    </a>
                    <a href="/design-system/detalhes-empresa" className="btn-primary">
                        Detalhes da Empresa
                    </a>
                    <a href="/admin" className="btn-primary bg-slate-900 border-slate-900 text-white hover:bg-slate-700">
                        Painel Admin (Cozinha)
                    </a>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button>Default Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Inputs</h2>
                <div className="max-w-sm space-y-[20px]">
                    <Input type="email" placeholder="Email" />
                    <Input type="password" placeholder="Password" />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Cards</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content area. You can put anything here.</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Action</Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Modals & Sheets</h2>
                <div className="flex gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Open Dialog (Modal)</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                    This is a modal dialog. You can put forms or confirmation
                                    messages here.
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">Open Sheet (Sidebar)</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Edit Profile</SheetTitle>
                                <SheetDescription>
                                    Make changes to your profile here. Click save when you're done.
                                </SheetDescription>
                            </SheetHeader>
                        </SheetContent>
                    </Sheet>
                </div>
            </section>
        </div >
    );
}
