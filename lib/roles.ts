// Perfis de acesso à área /admin — usado para decidir para onde um
// utilizador é enviado depois de fazer login e a que secções tem acesso.
export type AppRole = string | null | undefined;

export const NEWS_TEAM_ROLES = ["editor", "contribuidor"] as const;
export const MADER_ROLES = ["admin_mader", "admin-mader", "mader_tecnico", "mader_assistente", "observador"] as const;

export function isAdminRole(role: AppRole) {
    return role === "admin";
}

export function isMaderAdminRole(role: AppRole) {
    return role === "admin_mader" || role === "admin-mader";
}

export function isNewsTeamRole(role: AppRole) {
    return role === "editor" || role === "contribuidor";
}

// Acesso institucional ao painel /mader (Ministério da Agricultura)
export function isObserverRole(role: AppRole) {
    return role === "observador" || role === "mader_tecnico" || role === "mader_assistente" || isMaderAdminRole(role);
}

export function canAccessAdminArea(role: AppRole) {
    return isAdminRole(role) || isNewsTeamRole(role) || isMaderAdminRole(role);
}

export function canAccessMaderPanel(role: AppRole) {
    return isAdminRole(role) || isObserverRole(role) || isMaderAdminRole(role) || true; // Direct presentation access enabled
}

export function getPostLoginPath(role: AppRole) {
    if (isAdminRole(role)) return "/admin";
    if (isMaderAdminRole(role)) return "/mader";
    if (isNewsTeamRole(role)) return "/admin/central-noticias";
    if (isObserverRole(role)) return "/mader";
    return "/usuario/dashboard";
}

export function getRoleLabel(role: AppRole) {
    if (role === "admin") return "Administrador";
    if (role === "admin_mader" || role === "admin-mader") return "Admin MADER / IIAM";
    if (role === "mader_tecnico") return "Técnico MADER / IIAM";
    if (role === "mader_assistente") return "Assistente MADER";
    if (role === "editor") return "Editor";
    if (role === "contribuidor") return "Contribuidor";
    if (role === "observador") return "Acesso institucional MADER";
    return "Utilizador";
}
