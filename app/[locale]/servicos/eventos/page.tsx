"use client";

import { PageHeader } from "@/components/PageHeader";
import { Calendar, MapPin, Users, Ticket, ChevronLeft, ChevronRight, Mic2, Award } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function EventosPage() {
    // Left Column Data (Past Events Highlights)
    const pastEvents = [
        {
            title: "MozGrow 2024",
            description: "Cimeira de desenvolvimento agrário e inovação tecnológica.",
            icon: Mic2,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            title: "Feira de Manica",
            description: "Exposição das potencialidades agrícolas da província de Manica.",
            icon: Calendar,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            title: "Prémio Agrário",
            description: "Cerimónia de distinção das melhores práticas do sector.",
            icon: Award,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500"
        }
    ];

    // Right Column Data (Upcoming Events)
    const upcomingEvents = [
        {
            id: "agro-tech-summit",
            title: "Agro-Tech Summit",
            dateStr: "15/03",
            year: "25",
            fullDate: "15 Março 2025",
            duration: "1 dia",
            location: "Maputo",
            organizer: "TechMoz",
            status: "Inscrições Abertas"
        },
        {
            id: "facim-2025",
            title: "FACIM 2025",
            dateStr: "25/08",
            year: "25",
            fullDate: "25-31 Agosto 2025",
            duration: "7 dias",
            location: "Ricatla, Marracuene",
            organizer: "APIEX",
            status: "Confirmado"
        },
        {
            id: "forum-investimento",
            title: "Fórum de Investimento",
            dateStr: "10/09",
            year: "25",
            fullDate: "10 Setembro 2025",
            duration: "2 dias",
            location: "Beira",
            organizer: "CTA",
            status: "Brevemente"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center">
            <div className="w-full">
                <PageHeader
                    title="Feiras & Eventos"
                    icon={Calendar}
                    backgroundImage="https://images.unsplash.com/photo-1472653431158-6364773b2a56?q=80&w=2000&auto=format&fit=crop"
                    breadcrumbs={[
                        { label: "Início", href: "/" },
                        { label: "Serviços", href: "/servicos" },
                        { label: "Eventos", href: undefined }
                    ]}
                />
            </div>

            <div className="container-site relative z-20 mt-[50px] pb-24">


                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-0">

                    {/* Left Column: Past Events (35%) */}
                    <div className="lg:pr-[30px] flex flex-col h-full">
                        <div className="border-b border-slate-200 pb-[10px] text-left lg:-mr-[30px] lg:pr-[30px] shrink-0 relative">
                            <h3 className="text-2xl md:text-3xl font-black text-[#3a3f47]">
                                Eventos <span className="text-[#f97316]">Passados</span>
                            </h3>
                            <div className="hidden lg:block absolute right-0 bottom-0 w-[1px] h-[40px] bg-slate-200 translate-y-[-1px]"></div>
                        </div>
                        <div className="flex flex-col gap-6 pt-8 lg:-mr-[30px] lg:pr-[30px] border-r border-slate-200 flex-1">
                            {pastEvents.map((event, i) => (
                                <div
                                    key={i}
                                    className="p-6 rounded-[15px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${event.iconBg}`}>
                                            <event.icon className={`h-5 w-5 ${event.iconColor}`} />
                                        </div>
                                        <h3 className="text-lg font-bold leading-tight text-[#3a3f47]">{event.title}</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-500">
                                        {event.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Upcoming Events (65%) */}
                    <div className="space-y-8 lg:pl-[30px] flex flex-col h-full">
                        <div className="border-b border-slate-200 pb-[10px] text-left lg:-ml-[30px] lg:pl-[30px] shrink-0">
                            <h3 className="text-2xl md:text-3xl font-black text-[#3a3f47]">
                                Próximos <span className="text-[#f97316]">Eventos</span>
                            </h3>
                        </div>
                        <div className="flex flex-col gap-6">
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex flex-col rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 transition-all duration-300 group overflow-hidden"
                                >
                                    {/* Top Section: Date & Details */}
                                    <div className="flex flex-row flex-1 border-b border-slate-100">
                                        {/* Left Column: Date (20%) */}
                                        <div className="w-[20%] bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-2 text-center shrink-0">
                                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">
                                                {event.dateStr}
                                            </div>
                                            <div className="w-8 h-[2px] bg-slate-200 my-1"></div>
                                            <div className="text-[50px] leading-none font-black text-[#3a3f47] tracking-tighter">
                                                {event.year}
                                            </div>
                                        </div>

                                        {/* Right Column: Details (80%) */}
                                        <div className="flex-1 p-5 flex flex-col justify-center">
                                            <h4 className="text-lg font-bold text-[#3a3f47] group-hover:text-[#f97316] transition-colors mb-2 leading-tight">
                                                {event.title}
                                            </h4>
                                            <div className="space-y-1.5 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span className="line-clamp-1"><b className="text-[#3a3f47]">Organização:</b> {event.organizer}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span className="line-clamp-1"><b className="text-[#3a3f47]">Local:</b> {event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    <span><b className="text-[#3a3f47]">Duração:</b> {event.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Footer (Full Width) */}
                                    <div className="px-5 py-4 bg-slate-100 flex items-center justify-between border-t border-slate-200">
                                        <span className="text-sm font-bold text-slate-600">
                                            {event.duration}
                                        </span>
                                        <span className="px-3 py-1 rounded-[7px] bg-emerald-500 text-white text-xs font-bold shadow-sm">
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-start items-center gap-2 pt-8 mt-auto">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-transparent text-slate-500 hover:border-[#f97316] hover:text-[#f97316] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#f97316] text-[#f97316] font-bold shadow-sm">
                                1
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#f97316] hover:text-[#f97316] transition-colors shadow-sm">
                                2
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#f97316] hover:text-[#f97316] transition-colors shadow-sm">
                                3
                            </button>
                            <span className="text-slate-400 px-2">...</span>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-transparent text-slate-500 hover:border-[#f97316] hover:text-[#f97316] transition-colors shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <ContactCTA
                    title="Tem um evento para promover?"
                    description="Oferecemos cobertura media, gestão de convites e logística completa para o seu evento agrário. Vamos tornar o seu evento memorável."
                    buttonText="Solicitar Apoio"
                />
            </div>
        </main>
    );
}
