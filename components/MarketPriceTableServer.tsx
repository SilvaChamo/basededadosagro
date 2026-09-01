import { supabase } from "@/lib/supabaseClient";
import { MarketPriceTableClient } from "@/components/MarketPriceTableClient";

/** Busca as cotações no servidor (perto da base de dados) antes de enviar a
 * página — chega já pronta, sem o utilizador ter de esperar por um pedido
 * extra feito pelo browser depois de a página aparecer.
 *
 * Cotações são dados públicos: usa-se o cliente anónimo (sem cookies()) em
 * vez do cliente de sessão, senão o cookies() obrigava /mercado a renderizar
 * de novo em cada pedido (sem cache). */
export async function MarketPriceTableServer() {
    const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('product', { ascending: true });

    if (error) {
        console.error("Error fetching market prices:", error);
    }

    return <MarketPriceTableClient initialData={data ?? []} />;
}
