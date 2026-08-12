import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Email regex pattern
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone regex patterns (international and Mozambique-specific)
const phoneRegex = /(?:\+258|258)?[\s.-]?(?:8[2-7]|21|23|24|25|26|27|28|29)[\s.-]?\d{3}[\s.-]?\d{4}/g;
const phoneGenericRegex = /(?:\+\d{1,3}[\s.-]?)?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

export async function POST(request: Request) {
    try {
        const { url, company_id, company_name } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Fetch the website content
        let html = "";
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; BaseDadosAgro/1.0; +https://basededadosagro.com)'
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            html = await response.text();
        } catch (fetchError: any) {
            console.error(`Failed to fetch ${url}:`, fetchError.message);
            return NextResponse.json({
                success: false,
                error: `Failed to fetch website: ${fetchError.message}`,
                contacts: []
            });
        }

        // Extract emails
        const emails = [...new Set(html.match(emailRegex) || [])];

        // Filter out common non-contact emails
        const filteredEmails = emails.filter(email =>
            !email.includes('example.com') &&
            !email.includes('youremail') &&
            !email.includes('email@') &&
            !email.includes('sentry') &&
            !email.includes('webpack') &&
            !email.endsWith('.png') &&
            !email.endsWith('.jpg')
        );

        // Extract phones
        const phones = [...new Set([
            ...(html.match(phoneRegex) || []),
            ...(html.match(phoneGenericRegex) || [])
        ])];

        // Clean phone numbers
        const cleanedPhones = phones
            .map((p: any) => p.replace(/[\s.-]/g, ''))
            .filter((p: any) => p.length >= 9 && p.length <= 15);

        // If no contacts found, return empty
        if (filteredEmails.length === 0 && cleanedPhones.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No contacts found",
                contacts: []
            });
        }

        // Create Supabase client
        const supabase = await createClient();

        // Prepare contacts to insert
        const contactsToInsert = [];

        // Create a contact for each unique email
        for (const email of filteredEmails.slice(0, 5)) { // Limit to 5 emails
            contactsToInsert.push({
                company_id,
                name: company_name ? `Contacto - ${company_name}` : "Contacto do Website",
                role: "Contacto Geral",
                email,
                phone: cleanedPhones[0] || null,
                whatsapp: cleanedPhones[0] || null,
                source: "website",
                notes: `Importado automaticamente de ${url}`,
                is_verified: false
            });
        }

        // If no emails but has phones, add phone-only contact
        if (filteredEmails.length === 0 && cleanedPhones.length > 0) {
            contactsToInsert.push({
                company_id,
                name: company_name ? `Contacto - ${company_name}` : "Contacto do Website",
                role: "Contacto Geral",
                email: null,
                phone: cleanedPhones[0],
                whatsapp: cleanedPhones[0],
                source: "website",
                notes: `Importado automaticamente de ${url}`,
                is_verified: false
            });
        }

        // Check for existing contacts to avoid duplicates
        const { data: existingContacts } = await supabase
            .from('contacts')
            .select('email, phone')
            .eq('company_id', company_id);

        const existingEmails = new Set(existingContacts?.map((c: any) => c.email) || []);
        const existingPhones = new Set(existingContacts?.map((c: any) => c.phone) || []);

        // Filter out already existing contacts
        const newContacts = contactsToInsert.filter((c: any) =>
            !existingEmails.has(c.email) && !existingPhones.has(c.phone)
        );

        if (newContacts.length === 0) {
            return NextResponse.json({
                success: true,
                message: "All contacts already exist",
                contacts: []
            });
        }

        // Insert new contacts
        const { data: insertedContacts, error } = await supabase
            .from('contacts')
            .insert(newContacts)
            .select();

        if (error) {
            console.error("Error inserting contacts:", error);
            return NextResponse.json({
                success: false,
                error: error.message,
                contacts: []
            });
        }

        return NextResponse.json({
            success: true,
            contacts: insertedContacts,
            emailsFound: filteredEmails.length,
            phonesFound: cleanedPhones.length
        });

    } catch (error: any) {
        console.error("Scrape error:", error);
        return NextResponse.json({
            error: error.message,
            contacts: []
        }, { status: 500 });
    }
}
