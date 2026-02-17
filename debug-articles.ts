// Script para debug de artigos
import { createClient } from './utils/supabase/server';

async function debugArticles() {
  const supabase = await createClient();

  console.log('=== DEBUG DE ARTIGOS ===');

  // 1. Ver todos os artigos (incluindo eliminados)
  const { data: allArticles, error: allError } = await supabase
    .from('articles')
    .select('id, title, deleted_at, type')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('Erro ao buscar todos os artigos:', allError);
    return;
  }

  console.log('\n📋 TODOS OS ARTIGOS:');
  console.log(`Total: ${allArticles?.length || 0}`);
  allArticles?.forEach((article: any) => {
    console.log(`- [${article.deleted_at ? '🗑️ ELIMINADO' : '✅ ATIVO'}] ${article.title} (${article.type})`);
    console.log(`  ID: ${article.id}, Deleted: ${article.deleted_at || 'null'}`);
  });

  // 2. Ver apenas artigos activos (o que a página do blog vê)
  const { data: activeArticles, error: activeError } = await supabase
    .from('articles')
    .select('id, title, deleted_at, type')
    .is('deleted_at', null)
    .neq('type', 'document')
    .neq('type', 'Relatório')
    .order('date', { ascending: false });

  if (activeError) {
    console.error('Erro ao buscar artigos activos:', activeError);
    return;
  }

  console.log('\n✅ ARTIGOS ACTIVOS (visíveis no blog):');
  console.log(`Total: ${activeArticles?.length || 0}`);
  activeArticles?.forEach((article: any) => {
    console.log(`- ${article.title} (${article.type})`);
    console.log(`  ID: ${article.id}`);
  });

  // 3. Ver artigos na lixeira
  const { data: deletedArticles, error: deletedError } = await supabase
    .from('articles')
    .select('id, title, deleted_at, type')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (deletedError) {
    console.error('Erro ao buscar artigos eliminados:', deletedError);
    return;
  }

  console.log('\n🗑️ ARTIGOS NA LIXEIRA:');
  console.log(`Total: ${deletedArticles?.length || 0}`);
  deletedArticles?.forEach((article: any) => {
    console.log(`- ${article.title} (${article.type})`);
    console.log(`  ID: ${article.id}, Deleted: ${article.deleted_at}`);
  });

  console.log('\n=== FIM DO DEBUG ===');
}

// Exportar para poder usar no browser
if (typeof window !== 'undefined') {
  (window as any).debugArticles = debugArticles;
}

export default debugArticles;
