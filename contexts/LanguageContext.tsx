"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export type Language = 'PT' | 'EN';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const nt = useTranslations();

    // Sincronizar o estado interno com o locale do next-intl
    const [language, setLanguageState] = useState<Language>(locale.toUpperCase() as Language);

    useEffect(() => {
        setLanguageState(locale.toUpperCase() as Language);
    }, [locale]);

    const setLanguage = (lang: Language) => {
        const newLocale = lang.toLowerCase();
        
        // Substituir o [locale] no pathname atual 
        // Ex: /pt/sobre-nos -> /en/sobre-nos
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPathname = segments.join('/');
        
        router.push(newPathname);
    };

    const toggleLanguage = () => {
        const newLang = language === 'PT' ? 'EN' : 'PT';
        setLanguage(newLang);
    };

    const t = (key: string): string => {
        try {
            return nt(key);
        } catch (e) {
            return key;
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
