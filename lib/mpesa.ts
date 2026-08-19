// Auxiliares partilhados entre as rotas de pagamento M-Pesa (pedido e
// consulta de estado) — evita duplicar a obtenção do token de acesso.
const MPESA_BASE_URL = "https://api.sandbox.vm.co.mz/ipg/v1x";

export function getMpesaCredentials() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    return { consumerKey, consumerSecret, shortcode, passkey };
}

export async function getMpesaAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch(`${MPESA_BASE_URL}/token`, {
        method: "GET",
        headers: {
            Authorization: `Basic ${auth}`,
            Origin: "developer.mpesa.vm.co.mz",
        },
    });

    if (!tokenResponse.ok) {
        throw new Error("Failed to generate M-Pesa token");
    }

    const tokenData = await tokenResponse.json();
    return tokenData.output_SessionID || tokenData.access_token;
}

export { MPESA_BASE_URL };
