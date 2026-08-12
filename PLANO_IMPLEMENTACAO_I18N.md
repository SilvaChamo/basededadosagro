# 🌐 Plano Mestre de Implementação i18n - BaseAgroData

Este documento serve como guião técnico para a migração da plataforma `baseagrodata.com` para suporte multilíngue (Português/Inglês) utilizando `next-intl`.

## 📋 Pré-requisitos

Instalar a biblioteca de internacionalização:
```bash
npm install next-intl
```

---

## 🚀 Fase 1: Configuração da Infraestrutura

### 1.1. Estrutura de Pastas
Criar a pasta `messages` na raiz do projeto (ao mesmo nível de `app` e `lib`).

```
/messages
  ├── pt.json  (Colar aqui o JSON gerado anteriormente)
  └── en.json  (Cópia do pt.json, traduzido futuramente)
```

### 1.2. Configuração do Plugin (`next.config.mjs`)
Configurar o plugin para gerir as rotas e carregamento de mensagens.

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ... outras configurações existentes
};

export default withNextIntl(nextConfig);
```

### 1.3. Configuração de Navegação (`src/i18n.ts` ou raiz `i18n.ts`)
Criar o ficheiro de configuração de requisição.

```typescript
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

### 1.4. Middleware Unificado (`middleware.ts`)
**Crítico:** É necessário combinar o middleware do `next-intl` com o do `Supabase`.

```typescript
import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';

const handleI18nRouting = createIntlMiddleware({
  locales: ['pt', 'en'],
  defaultLocale: 'pt'
});

export async function middleware(request: NextRequest) {
  // 1. Executar lógica do Supabase (Sessão/Auth)
  const response = await updateSession(request);

  // 2. Se for uma resposta de redirecionamento do Supabase, retornar imediatamente
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 3. Executar lógica de roteamento i18n
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)']
};
```

---

## 🛠 Fase 2: Refatoração de Dados (`services-data.ts`)

O ficheiro `lib/services-data.ts` contém texto misturado com lógica (ícones). Precisamos separar.

### 2.1. Criar `lib/services-config.ts`
Este ficheiro manterá apenas a estrutura e os ícones, removendo todo o texto.

```typescript
import { Truck, Globe, ShieldCheck /* ... outros imports */ } from "lucide-react";

// Mapeamento apenas de IDs e Ícones
export const servicesConfig = {
    "logistica": {
        id: "logistica",
        icon: Truck, // O ícone fica aqui pois não é traduzível
        subCategories: {
            "transporte": { slug: "transporte", icon: Truck },
            "multimodal": { slug: "multimodal", icon: Globe },
            // ...
        }
    },
    // ...
};
```

### 2.2. Atualizar Componentes Consumidores
Onde antes se lia `servicesData['logistica'].title`, agora deve-se ler do hook de tradução.

**Exemplo de componente refatorado:**

```typescriptreact
import { useTranslations } from 'next-intl';
import { servicesConfig } from '@/lib/services-config';

export default function ServicesSection() {
  const t = useTranslations('ServicesData'); // Namespace do JSON

  return (
    <div>
      {Object.values(servicesConfig).map((service) => (
        <div key={service.id}>
           {/* Ícone vem da config estática */}
           <service.icon />

           {/* Texto vem da tradução dinâmica */}
           <h1>{t(`${service.id}.title`)}</h1>
           <p>{t(`${service.id}.description`)}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Fase 3: Interface do Utilizador (Páginas)

### 3.1. Refatorar Páginas Principais
Para cada página (`app/page.tsx`, `app/sobre-nos/page.tsx`, etc.):
1.  Importar `useTranslations`.
2.  Substituir strings hardcoded por chaves: `{t('hero.title')}`.

### 3.2. Seletor de Idioma
Criar um componente `LanguageSwitcher` para mudar entre `/pt` e `/en`.

```typescriptreact
'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (locale: string) => {
    // Lógica simplificada: substituir o prefixo do path
    const newPath = pathname.replace(/^\/(pt|en)/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <button onClick={() => switchLocale('en')}>EN</button>
  );
}
```

---

## ✅ Checklist Final

- [ ] `next-intl` instalado.
- [ ] `messages/pt.json` criado com todo o conteúdo extraído.
- [ ] `middleware.ts` atualizado para suportar i18n + Supabase.
- [ ] `services-data.ts` convertido para `services-config.ts` (sem texto).
- [ ] Páginas principais refatoradas para usar `useTranslations`.
- [ ] Teste de navegação entre idiomas.