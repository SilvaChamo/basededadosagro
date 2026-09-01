import type { Metadata } from "next";

// Título/descrição próprios desta secção (SEO). O template do layout raiz
// acrescenta " · Base de Dados Agro". As páginas de detalhe [slug]/[id]
// podem sobrepor-se com o seu próprio generateMetadata.
export const metadata: Metadata = {
  title: "Mercado agrícola — preços e cotações",
  description: "Preços e cotações de produtos agrícolas em Moçambique (SIMA), mercado digital e tendências.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
