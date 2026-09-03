"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    canEditField,
    getEditableFields,
    hasDashboardAccess,
    getRequiredPlan,
    normalizePlanName,
    getPlanDisplayName,
    getProductLimit,
    canUseSMSNotifications,
    canUsePresentations,
    canCreateProduct,
    getRemainingProducts,
    canHaveFeaturedCompany,
    canViewAnalytics,
    canManageProfileSharing,
    canPublishJobs,
    type PlanType
} from "@/lib/plan-fields";

interface UsePlanPermissionsResult {
    plan: PlanType;
    loading: boolean;
    canEdit: (fieldName: string) => boolean;
    getRequiredPlanForField: (fieldName: string) => PlanType | null;
    editableFields: string[];
    hasDashboard: boolean;
    planDisplayName: string;
    // Features
    productLimit: number;
    canSMS: boolean;
    canPresentations: boolean;
    canFeatured: boolean;
    canAnalytics: boolean;
    canManageSharing: boolean;
    canJobs: boolean;
    canCreateNewProduct: (productsThisMonth: number) => boolean;
    remainingProducts: (productsThisMonth: number) => number;
}

export function usePlanPermissions(): UsePlanPermissionsResult {
    const [plan, setPlan] = useState<PlanType>('Gratuito');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const supabase = createClient();
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    setPlan('Gratuito');
                    setLoading(false);
                    return;
                }

                // Fetch both company and profile plans
                const [companyResult, profileResult] = await Promise.all([
                    supabase.from('companies').select('plan').eq('user_id', user.id).maybeSingle(),
                    supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle()
                ]);

                const companyPlan = normalizePlanName(companyResult.data?.plan);
                const profilePlan = normalizePlanName(profileResult.data?.plan);

                // Use PLAN_HIERARCHY to find the highest plan
                const { PLAN_HIERARCHY } = await import("@/lib/plan-fields");
                const companyIndex = PLAN_HIERARCHY.indexOf(companyPlan);
                const profileIndex = PLAN_HIERARCHY.indexOf(profilePlan);

                if (profileIndex >= companyIndex) {
                    setPlan(profilePlan);
                } else {
                    setPlan(companyPlan);
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
                setPlan('Gratuito');
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, []);

    return {
        plan,
        loading,
        canEdit: (fieldName: string) => canEditField(plan, fieldName),
        getRequiredPlanForField: (fieldName: string) => getRequiredPlan(fieldName),
        editableFields: getEditableFields(plan),
        hasDashboard: hasDashboardAccess(plan),
        planDisplayName: getPlanDisplayName(plan),
        // Features
        productLimit: getProductLimit(plan),
        canSMS: canUseSMSNotifications(plan),
        canPresentations: canUsePresentations(plan),
        canFeatured: canHaveFeaturedCompany(plan),
        canAnalytics: canViewAnalytics(plan),
        canManageSharing: canManageProfileSharing(plan),
        canJobs: canPublishJobs(plan),
        canCreateNewProduct: (productsThisMonth: number) => canCreateProduct(plan, productsThisMonth),
        remainingProducts: (productsThisMonth: number) => getRemainingProducts(plan, productsThisMonth)
    };
}


