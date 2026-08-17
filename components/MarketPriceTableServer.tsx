import { createClient } from "@/utils/supabase/server";
import { MarketPriceTableClient } from "@/components/MarketPriceTableClient";

/** Busca as cotações no servidor (perto da base de dados) antes de enviar a
 * página — chega já pronta, sem o utilizador ter de esperar por um pedido
 * extra feito pelo browser depois de a página aparecer. */
export async function MarketPriceTableServer() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('product', { ascending: true });

    if (error) {
        console.error("Error fetching market prices:", error);
    }

    return <MarketPriceTableClient initialData={data ?? []} />;
}
