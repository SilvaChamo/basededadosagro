"use client";

import React, { ReactNode } from "react";
import { PageHeader } from "./PageHeader";

interface StandardBlogTemplateProps {
    title: string | ReactNode;
    breadcrumbs: { label: string; href?: string }[];
    sidebarComponents: ReactNode;
    children: ReactNode;
    backgroundImage?: string;
    isSidebarLeft?: boolean;
    topFullWidthContent?: ReactNode;
    bottomFullWidthContent?: ReactNode;
    titleClassName?: string;
}

export function StandardBlogTemplate({
    title,
    breadcrumbs,
    sidebarComponents,
    children,
    backgroundImage = "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2000&auto=format&fit=crop",
    isSidebarLeft = false,
    topFullWidthContent,
    bottomFullWidthContent,
    titleClassName
}: StandardBlogTemplateProps) {
    return (
        <div className="min-h-screen bg-background text-slate-900 font-sans">
            <PageHeader
                title={title}
                backgroundImage={backgroundImage}
                breadcrumbs={breadcrumbs}
                titleClassName={titleClassName}
            />

            {topFullWidthContent && (
                <div className="w-full">
                    {topFullWidthContent}
                </div>
            )}

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
