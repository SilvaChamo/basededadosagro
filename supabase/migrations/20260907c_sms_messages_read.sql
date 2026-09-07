-- Estado de leitura das SMS recebidas: não lidas aparecem a negrito no painel.
ALTER TABLE basededados.sms_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;
NOTIFY pgrst, 'reload schema';
