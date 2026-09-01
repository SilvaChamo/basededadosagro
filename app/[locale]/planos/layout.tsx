import type { Metadata } from "next";

// Título/descrição próprios desta secção (SEO). O template do layout raiz
// acrescenta " · Base de Dados Agro". As páginas de detalhe [slug]/[id]
// podem sobrepor-se com o seu próprio generateMetadata.
export const metadata: Metadata = {
  title: "Planos e subscrição",
  description: "Planos de acesso à Base de Dados Agro para produtores, empresas e profissionais.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
