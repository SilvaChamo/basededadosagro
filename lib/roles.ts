// Perfis de acesso à área /admin — usado para decidir para onde um
// utilizador é enviado depois de fazer login e a que secções tem acesso.
export type AppRole = string | null | undefined;

export const NEWS_TEAM_ROLES = ["editor", "contribuidor"] as const;

export function isAdminRole(role: AppRole) {
    return role === "admin";
}

export function isNewsTeamRole(role: AppRole) {
    return role === "editor" || role === "contribuidor";
}

export function canAccessAdminArea(role: AppRole) {
    return isAdminRole(role) || isNewsTeamRole(role);
}

export function getPostLoginPath(role: AppRole) {
    if (isAdminRole(role)) return "/admin";
    if (isNewsTeamRole(role)) return "/admin/central-noticias";
    return "/usuario/dashboard";
}

export function getRoleLabel(role: AppRole) {
    if (role === "admin") return "Administrador";
    if (role === "editor") return "Editor";
    if (role === "contribuidor") return "Contribuidor";
    return "Utilizador";
}
