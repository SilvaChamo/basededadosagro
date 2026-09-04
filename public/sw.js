/*
 * Service worker KILL-SWITCH — Set/2026.
 *
 * O PWA foi desligado de propósito (ver next.config.ts). Este ficheiro
 * substitui o service worker antigo gerado pelo next-pwa. Em vez de
 * guardar e servir páginas/JS de cache (o que fazia o site mostrar
 * versões antigas mesmo depois de deploy), este SW:
 *   1. assume o controlo imediatamente (skipWaiting + clients.claim);
 *   2. apaga TODAS as caches do Cache Storage;
 *   3. remove o seu próprio registo (unregister);
 *   4. recarrega as abas abertas para receberem a versão fresca.
 *
 * Não intercepta pedidos (sem handler de 'fetch') — tudo vai à rede.
 * Quando o tráfego já não tiver browsers com o SW antigo, este ficheiro
 * pode ser apagado.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (e) {
        /* ignora */
      }

      try {
        await self.clients.claim();
      } catch (e) {
        /* ignora */
      }

      try {
        await self.registration.unregister();
      } catch (e) {
        /* ignora */
      }

      try {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          client.navigate(client.url);
        }
      } catch (e) {
        /* ignora */
      }
    })()
  );
});
