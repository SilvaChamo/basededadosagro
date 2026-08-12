const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base de Dados Agro",
  alternateName: ["BaseDeDadosAgro", "Base de Dados", "Base", "Dados", "Agro"],
  url: "https://basededadosagro.com",
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
    />
  );
}
