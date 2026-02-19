"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, LucideIcon, ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BackButton {
    label: string;
    href: string;
}

interface PageHeaderProps {
    title: string | ReactNode;
    breadcrumbs: BreadcrumbItem[];
    backgroundImage?: string;
    icon?: LucideIcon;
    backButton?: BackButton;
    overlayOpacity?: string;
    children?: ReactNode;
    titleClassName?: string;
}

export function PageHeader({ title, breadcrumbs, backgroundImage, icon: Icon, backButton, overlayOpacity = "opacity-80", children, titleClassName }: PageHeaderProps) {
    const [isSticky, setIsSticky] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!headerRef.current) return;
            const rect = headerRef.current.getBoundingClientRect();
            // 72px is roughly the fixed Navbar height
            if (rect.bottom <= 72) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        // Run once on mount to check initial position
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div ref={headerRef} className="w-full bg-gradient-to-r from-emerald-950 via-green-900 via-teal-900 to-emerald-950 text-white pt-36 pb-16 relative overflow-visible">
            {/* Optional Background Image Overlay */}
            {/* Optional Background Image Overlay */}
            {backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div className={`absolute inset-0 z-0 bg-emerald-950 ${overlayOpacity}`} />
                </>
            )}

            {/* Decorative Icon */}
            {Icon && (
                <div className="absolute -right-6 -bottom-12 text-white/10 z-0 pointer-events-none transform rotate-[-15deg]">
                    <Icon strokeWidth={1} className="w-64 h-64" />
                </div>
            )}

            <div className="container-site relative z-10 flex flex-col items-center text-center">
                <h1 className={`text-white mb-4 ${titleClassName || "text-[30px] md:text-[45px] font-extrabold tracking-tight"}`}>{title}</h1>
                <nav className="flex items-center justify-center text-xs md:text-sm text-white font-medium">
                    {breadcrumbs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-[#f97316]" />}
                            {item.href ? (
                                <Link href={item.href} className="hover:text-[#f97316] transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-[#f97316] cursor-default">{item.label}</span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Back Button */}
                {backButton && (
                    <Link
                        href={backButton.href}
                        className="btn-outline mt-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        {backButton.label}
                    </Link>
                )}
            </div>

            {/* Custom Content (e.g. Search Bar) */}
            {children && (
                <div className="container-site relative z-10 mt-8 pb-4">
                    {children}
                </div>
            )}

        </div>
    );
}
