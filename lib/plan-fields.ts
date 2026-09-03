/**
 * Plan-based field permissions for company registration
 * Defines which fields are editable for each subscription plan
 */

export type PlanType = 'Gratuito' | 'Básico' | 'Premium' | 'Business Vendedor' | 'Parceiro';

export interface FieldPermission {
    field: string;
    label: string;
    requiredPlan: PlanType;
}

// All company fields with their minimum required plan
export const COMPANY_FIELDS: FieldPermission[] = [
    // Free Plan Fields
    { field: 'name', label: 'Nome da Empresa', requiredPlan: 'Gratuito' },
    { field: 'contact', label: 'Contacto', requiredPlan: 'Gratuito' },

    // Básico Plan Fields
    { field: 'district', label: 'Distrito', requiredPlan: 'Básico' },
    { field: 'services', label: 'Serviços', requiredPlan: 'Básico' },

    // Premium Plan Fields
    { field: 'nuit', label: 'NUIT', requiredPlan: 'Premium' },
    { field: 'email', label: 'Email Corporativo', requiredPlan: 'Premium' },
    { field: 'mission', label: 'Missão', requiredPlan: 'Premium' },
    { field: 'vision', label: 'Visão', requiredPlan: 'Premium' },
    { field: 'values', label: 'Valores', requiredPlan: 'Premium' },
    { field: 'social_facebook', label: 'Facebook', requiredPlan: 'Premium' },
    { field: 'social_instagram', label: 'Instagram', requiredPlan: 'Premium' },
    { field: 'social_linkedin', label: 'LinkedIn', requiredPlan: 'Premium' },

    // Business/Parceiro Fields
    { field: 'value_chain', label: 'Cadeia de Valor', requiredPlan: 'Business Vendedor' },
    { field: 'website', label: 'Website', requiredPlan: 'Business Vendedor' },
    { field: 'slug', label: 'URL Personalizado', requiredPlan: 'Business Vendedor' },
];

// Plan hierarchy (higher index = more permissions)
export const PLAN_HIERARCHY: PlanType[] = [
    'Gratuito',
    'Básico',
    'Premium',
    'Business Vendedor',
    'Parceiro'
];

/**
 * Check if a plan has access to a specific field
 */
export function canEditField(userPlan: string | null | undefined, fieldName: string): boolean {
    const normalizedPlan = normalizePlanName(userPlan);

    // Parceiro has access to everything
    if (normalizedPlan === 'Parceiro') return true;

    const field = COMPANY_FIELDS.find(f => f.field === fieldName);
    if (!field) return false;

    const userPlanIndex = PLAN_HIERARCHY.indexOf(normalizedPlan);
    const requiredPlanIndex = PLAN_HIERARCHY.indexOf(field.requiredPlan);

    return userPlanIndex >= requiredPlanIndex;
}

/**
 * Get the required plan for a field
 */
export function getRequiredPlan(fieldName: string): PlanType | null {
    const field = COMPANY_FIELDS.find(f => f.field === fieldName);
    return field?.requiredPlan || null;
}

/**
 * Get all editable fields for a plan
 */
export function getEditableFields(userPlan: string | null | undefined): string[] {
    const normalizedPlan = normalizePlanName(userPlan);

    // Parceiro can edit everything
    if (normalizedPlan === 'Parceiro') {
        return COMPANY_FIELDS.map(f => f.field);
    }

    const userPlanIndex = PLAN_HIERARCHY.indexOf(normalizedPlan);

    return COMPANY_FIELDS
        .filter(f => PLAN_HIERARCHY.indexOf(f.requiredPlan) <= userPlanIndex)
        .map(f => f.field);
}

/**
 * Check if user has dashboard access
 */
export function hasDashboardAccess(userPlan: string | null | undefined): boolean {
    // All logged in users now have access to the dashboard (some with restricted menus)
    return true;
}

/**
 * Normalize plan name to handle variations and map to official names
 */
export function normalizePlanName(plan: string | null | undefined): PlanType {
    if (!plan) return 'Gratuito';

    const trimmed = plan.trim();
    const normalized = trimmed.toLowerCase();

    // Mapping to Gratuito (default case)
    if (normalized === 'gratuito' || normalized === 'free' || normalized === 'visitante' || normalized === 'grátis' || normalized === 'gratis') {
        return 'Gratuito';
    }

    // Mapping to Básico
    if (normalized === 'básico' || normalized === 'basico' || normalized === 'basic') {
        return 'Básico';
    }

    // Mapping to Premium
    if (normalized === 'premium' || normalized === 'profissional' || normalized === 'professional') {
        return 'Premium';
    }

    // Mapping to Business Vendedor
    if (normalized === 'business vendedor' || normalized === 'business' || normalized === 'vendedor' || normalized === 'empresarial') {
        return 'Business Vendedor';
    }

    // Mapping to Parceiro
    if (normalized === 'parceiro' || normalized === 'partner') {
        return 'Parceiro';
    }

    return 'Gratuito';
}

/**
 * Get display name for plan
 */
export function getPlanDisplayName(plan: PlanType): string {
    const names: Record<PlanType, string> = {
        'Gratuito': 'Gratuito',
        'Básico': 'Básico',
        'Premium': 'Premium',
        'Business Vendedor': 'Business Vendedor',
        'Parceiro': 'Parceiro'
    };
    return names[plan] || plan;
}

// ===========================================
// PLAN LIMITS & FEATURES
// ===========================================

/**
 * Product limits per month by plan
 */
export const PLAN_LIMITS: Record<PlanType, { products_per_month: number }> = {
    'Gratuito': { products_per_month: 0 },
    'Básico': { products_per_month: 1 },
    'Premium': { products_per_month: 7 },
    'Business Vendedor': { products_per_month: 10 },
    'Parceiro': { products_per_month: Infinity }
};

/**
 * Features available by plan
 */
export const PLAN_FEATURES: Record<PlanType, {
    sms_notifications: boolean;
    presentations: boolean;
    featured_company: boolean;
    business_analytics: boolean;
    newsletter: boolean;
    event_notifications: boolean;
    funding_alerts: boolean;
    email_support: boolean;
    simple_company_edit: boolean;
    profile_sharing_management: boolean;
}> = {
    'Gratuito': {
        sms_notifications: false,
        presentations: false,
        featured_company: false,
        business_analytics: false,
        newsletter: true,
        event_notifications: true,
        funding_alerts: true,
        email_support: true,
        simple_company_edit: true,
        profile_sharing_management: false
    },
    'Básico': {
        sms_notifications: false,
        presentations: false,
        featured_company: false,
        business_analytics: true,
        newsletter: true,
        event_notifications: true,
        funding_alerts: true,
        email_support: true,
        simple_company_edit: true,
        profile_sharing_management: true
    },
    'Premium': {
        sms_notifications: true,
        presentations: false,
        featured_company: false,
        business_analytics: true,
        newsletter: true,
        event_notifications: true,
        funding_alerts: true,
        email_support: true,
        simple_company_edit: true,
        profile_sharing_management: true
    },
    'Business Vendedor': {
        sms_notifications: true,
        presentations: true,
        featured_company: false,
        business_analytics: true,
        newsletter: true,
        event_notifications: true,
        funding_alerts: true,
        email_support: true,
        simple_company_edit: true,
        profile_sharing_management: true
    },
    'Parceiro': {
        sms_notifications: true,
        presentations: true,
        featured_company: true,
        business_analytics: true,
        newsletter: true,
        event_notifications: true,
        funding_alerts: true,
        email_support: true,
        simple_company_edit: true,
        profile_sharing_management: true
    }
};

/**
 * Detailed privileges for display in UI
 */
export const PLAN_PRIVILEGES: Record<PlanType, string[]> = {
    'Gratuito': [
        'Acesso limitado ao dashboard',
        'Receber alertas de financiamento',
        'Receber newsletter semanal',
        'Visualizar notícias do sector',
        'Perfil público básico'
    ],
    'Básico': [
        'Tudo do plano Free',
        'Publicar 1 produto/serviço no catálogo',
        'Acesso a métricas de visualização',
        'Gestão de contactos e leads',
        'Gestão de visibilidade do perfil'
    ],
    'Premium': [
        'Tudo do plano Básico',
        'Publicar até 7 produtos/serviços',
        'Acesso a relatórios de mercado detalhados',
        'Selo de empresa verificada',
        'Notificações SMS em tempo real'
    ],
    'Business Vendedor': [
        'Tudo do plano Premium',
        'Publicar até 10 produtos/serviços',
        'Acesso antecipado a oportunidades de negócio',
        'Personalização avançada do perfil (slug)',
        'Integração com cadeias de valor'
    ],
    'Parceiro': [
        'Acesso TOTAL e ILIMITADO',
        'Destaque máximo em toda a plataforma',
        'Gestão de múltiplas sub-contas',
        'Consultoria estratégica dedicada',
        'Funcionalidades customizadas sob demanda'
    ]
};

/**
 * Get product limit per month for a plan
 */
export function getProductLimit(userPlan: string | null | undefined): number {
    const normalizedPlan = normalizePlanName(userPlan);
    return PLAN_LIMITS[normalizedPlan]?.products_per_month ?? 0;
}

/**
 * Check if plan can use SMS notifications
 */
export function canUseSMSNotifications(userPlan: string | null | undefined): boolean {
    const normalizedPlan = normalizePlanName(userPlan);
    return PLAN_FEATURES[normalizedPlan]?.sms_notifications ?? false;
}

/**
 * Check if plan can access presentations
 */
export function canUsePresentations(userPlan: string | null | undefined): boolean {
    const normalizedPlan = normalizePlanName(userPlan);
    return PLAN_FEATURES[normalizedPlan]?.presentations ?? false;
}

/**
 * Get remaining products user can create this month
 * @param userPlan - User's current plan
 * @param productsThisMonth - Number of products already created this month
 */
export function getRemainingProducts(userPlan: string | null | undefined, productsThisMonth: number): number {
    const limit = getProductLimit(userPlan);
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - productsThisMonth);
}

/**
 * Check if user can create a new product
 */
export function canCreateProduct(userPlan: string | null | undefined, productsThisMonth: number): boolean {
    const remaining = getRemainingProducts(userPlan, productsThisMonth);
    return remaining > 0;
}

/**
 * Check if plan has featured company highlight (Parceiro only)
 */
export function canHaveFeaturedCompany(userPlan: string | null | undefined): boolean {
    const normalizedPlan = normalizePlanName(userPlan);
    return PLAN_FEATURES[normalizedPlan]?.featured_company ?? false;
}
/**
 * Check if plan has access to business analytics
 */
export function canViewAnalytics(userPlan: string | null | undefined): boolean {
    const normalizedPlan = normalizePlanName(userPlan);
    return PLAN_FEATURES[normalizedPlan]?.business_analytics ?? false;
}

export function canManageProfileSharing(userPlan: string | null | undefined): boolean {
    const normalizedPlan = normalizePlanName(userPlan);
    return PLAN_FEATURES[normalizedPlan]?.profile_sharing_management ?? false;
}

/**
 * Check if plan can publish job vacancies (Premium, Business Vendedor, Parceiro)
 */
export function canPublishJobs(userPlan: string | null | undefined): boolean {
    const normalizedPlan = normalizePlanName(userPlan);
    return normalizedPlan === 'Premium' || normalizedPlan === 'Business Vendedor' || normalizedPlan === 'Parceiro';
}
