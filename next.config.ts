import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
});

import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['recharts'],
  webpack: (config) => {
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "basededadosagro.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ppgmtxzuaxqshipnvebl.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "supabase.visualdesignmoz.com",
        pathname: "/**",
      },
      // Notícias pendentes (robô) trazem a imagem do artigo original, que
      // pode vir de qualquer site de notícias — não dá para listar hostname
      // a hostname aqui.
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      // NOTA (17 ago): removida a regra que forçava 'Cache-Control: public'
      // em bloco nestas páginas. Essa regra aplicava-se por igual aos
      // pedidos de página normal E aos pedidos internos de navegação do
      // Next.js (RSC) — como o Cloudflare não os distingue por defeito,
      // por vezes guardava a versão "em bruto" (dados internos, não a
      // página) e servia-a a visitantes normais, aparecendo como ecrã
      // preto com texto técnico. Ver histórico do PR que trouxe esta nota
      // para o diagnóstico completo. A cache volta a ser reintroduzida
      // página a página, via `export const revalidate`, que já não tem
      // este problema.
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.supabase.co *.google.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' blob: data: *.supabase.co supabase.visualdesignmoz.com res.cloudinary.com images.unsplash.com; font-src 'self' fonts.gstatic.com; connect-src 'self' *.supabase.co *.basededadosagro.com supabase.visualdesignmoz.com; frame-src *.google.com; object-src 'none';"
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/usuario/dashboard',
        permanent: true,
      },
    ];
  },
};

import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./i18n.ts');
 
export default withNextIntl(withPWA(nextConfig));
