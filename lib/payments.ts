// M-Pesa (Vodacom IPG) está em sandbox — não processa pagamentos reais e,
// sem credenciais de produção, o backend cai em "modo simulado" (marcava
// tudo como pago). Até haver credenciais de produção, os formulários de
// pagamento mostram só Transferência Bancária (aprovação manual em
// /admin/pagamentos). Pôr a true reactiva o M-Pesa em todo o lado.
export const MPESA_ENABLED = false;
