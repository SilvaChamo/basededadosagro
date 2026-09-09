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

// Acesso institucional só-leitura ao painel /mader (Ministério da
// Agricultura). Não dá acesso a /admin nem a nenhuma escrita.
export function isObserverRole(role: AppRole) {
    return role === "observador";
}

export function canAccessAdminArea(role: AppRole) {
    return isAdminRole(role) || isNewsTeamRole(role);
}

export function canAccessMaderPanel(role: AppRole) {
    return isAdminRole(role) || isObserverRole(role);
}

export function getPostLoginPath(role: AppRole) {
    if (isAdminRole(role)) return "/admin";
    if (isNewsTeamRole(role)) return "/admin/central-noticias";
    if (isObserverRole(role)) return "/mader";
    return "/usuario/dashboard";
}

export function getRoleLabel(role: AppRole) {
    if (role === "admin") return "Administrador";
    if (role === "editor") return "Editor";
    if (role === "contribuidor") return "Contribuidor";
    if (role === "observador") return "Acesso institucional";
    return "Utilizador";
}
