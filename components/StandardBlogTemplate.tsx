"use client";

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { PageHeader } from "./PageHeader";

interface StandardBlogTemplateProps {
    title: string | ReactNode;
    breadcrumbs: { label: string; href?: string }[];
    sidebarComponents: ReactNode;
    children: ReactNode;
    backgroundImage?: string;
    /** Ícone decorativo grande, semi-transparente, no canto inferior direito
     * do banner — mesma lógica usada nas páginas que chamam PageHeader
     * directamente (ex: Serviços, Galeria de Apresentações). */
    icon?: LucideIcon;
    isSidebarLeft?: boolean;
    topFullWidthContent?: ReactNode;
    bottomFullWidthContent?: ReactNode;
    stickyBar?: ReactNode;
    titleClassName?: string;
    hideHeader?: boolean;
}

export function StandardBlogTemplate({
    title,
    breadcrumbs,
    sidebarComponents,
    children,
    backgroundImage = "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2000&auto=format&fit=crop",
    icon,
    isSidebarLeft = false,
    topFullWidthContent,
    bottomFullWidthContent,
    stickyBar,
    titleClassName,
    hideHeader = false
}: StandardBlogTemplateProps) {
    return (
        <div className="min-h-screen bg-background text-slate-900 font-sans">
            {!hideHeader && (
                <PageHeader
                    title={title}
                    backgroundImage={backgroundImage}
                    icon={icon}
                    breadcrumbs={breadcrumbs}
                    titleClassName={titleClassName}
                />
            )}

            {topFullWidthContent && (
                <div className="w-full">
                    {topFullWidthContent}
                </div>
            )}

            {/* Fora do wrapper acima de propósito: para o `sticky` funcionar ao
                longo de todo o scroll, o "containing block" tem de se estender
                até ao fim do <main>, não só até ao fim do banner. */}
            {stickyBar}

            <main className="container-site pt-12 pb-[70px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-agro items-start">

                    {isSidebarLeft ? (
                        <>
                            {/* Sidebar on Left (4/12 columns = 33.3%, approx the 30% requested) */}
                            <aside className="lg:col-span-4 lg:col-start-1 space-y-agro sticky top-32 hidden lg:block">
                                {sidebarComponents}
                            </aside>

                            {/* Main Content Area on Right (8/12 columns) */}
                            <div className="lg:col-span-8 lg:col-start-5">
                                {children}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Main Content Area on Left */}
                            <div className="lg:col-span-9">
                                {children}
                            </div>

                            {/* Sidebar on Right */}
                            <aside className="lg:col-span-3 space-y-agro sticky top-32 hidden lg:block">
                                {sidebarComponents}
                            </aside>
                        </>
                    )}

                </div>
            </main>

            {bottomFullWidthContent && (
                <div className="w-full">
                    {bottomFullWidthContent}
                </div>
            )}
        </div>
    );
}
