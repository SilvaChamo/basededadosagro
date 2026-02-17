import { createClient } from '../utils/supabase/client';
import { servicesData } from '../lib/services-data';

interface SubCategory {
    slug: string;
    title: string;
    description: string;
    icon: any;
    fullDescription: string;
    subServices: { title: string; description: string }[];
    features: string[];
}

async function migrateData() {
    const supabase = createClient();
    console.log('Starting migration...');

    for (const categoryId in servicesData) {
        const category = servicesData[categoryId];
        for (const slug in category.subCategories) {
            const service = category.subCategories[slug];

            // Map icon back to string if needed, or use a default
            // In a real script we'd need a mapping back from components to strings
            // But for now we'll just use the slug or some known names
            const iconName = service.slug.charAt(0).toUpperCase() + service.slug.slice(1);

            const dataToInsert = {
                title: service.title,
                description: service.description,
                full_description: service.fullDescription,
                slug: service.slug,
                category: category.title,
                icon: iconName, // This is a best effort, might need manual check
                sub_services: service.subServices,
                features: service.features,
                is_active: true
            };

            const { error } = await supabase
                .from('services')
                .upsert(dataToInsert, { onConflict: 'slug' });

            if (error) {
                console.error(`Error migrating ${service.slug}:`, error.message);
            } else {
                console.log(`Migrated ${service.slug} successfully.`);
            }
        }
    }
    console.log('Migration finished.');
}

// migrateData(); // Commented out so it doesn't run on import
