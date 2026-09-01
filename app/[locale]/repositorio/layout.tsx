import type { Metadata } from "next";

// Título/descrição próprios desta secção (SEO). O template do layout raiz
// acrescenta " · Base de Dados Agro". As páginas de detalhe [slug]/[id]
// podem sobrepor-se com o seu próprio generateMetadata.
export const metadata: Metadata = {
  title: "Repositório de profissionais e documentos do agro",
  description: "Profissionais, técnicos e documentos do sector agrário de Moçambique.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
