import type { Metadata } from "next";

// Título/descrição próprios desta secção (SEO). O template do layout raiz
// acrescenta " · Base de Dados Agro". As páginas de detalhe [slug]/[id]
// podem sobrepor-se com o seu próprio generateMetadata.
export const metadata: Metadata = {
  title: "Inovação no sector agrícola",
  description: "Tecnologia, perfil digital, comunicação por SMS e repositório científico para o agro.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
