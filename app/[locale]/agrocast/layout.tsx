import type { Metadata } from "next";

// Título/descrição próprios desta secção (SEO). O template do layout raiz
// acrescenta " · Base de Dados Agro". As páginas de detalhe [slug]/[id]
// podem sobrepor-se com o seu próprio generateMetadata.
export const metadata: Metadata = {
  title: "AgroCast — podcast de agricultura",
  description: "Episódios do AgroCast sobre agricultura, clima e agronegócio em Moçambique.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
