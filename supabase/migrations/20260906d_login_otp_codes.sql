-- Login por telemóvel (OTP/SMS) sem depender do OTP nativo do Supabase — que
-- exigiria um gateway de SMS configurado no GoTrue partilhado com o
-- visualdesign. Aqui o código é gerado e enviado pela app (via httpSMS, ao
-- custo do SIM já pago), guardado aqui em hash, e a sessão é criada depois
-- com admin generateLink. Não altera nenhum outro método de login.
CREATE TABLE IF NOT EXISTS basededados.login_otp_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL,                 -- últimos 9 dígitos (número moçambicano)
    code_hash text NOT NULL,             -- sha256("<phone>:<código>")
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    attempts integer NOT NULL DEFAULT 0,
    consumed_at timestamptz,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_otp_codes_phone
    ON basededados.login_otp_codes (phone, created_at DESC);

ALTER TABLE basededados.login_otp_codes ENABLE ROW LEVEL SECURITY;

-- Só os endpoints do servidor (service role) mexem nesta tabela. Nenhum
-- utilizador autenticado ou anónimo lê ou escreve códigos OTP.
DROP POLICY IF EXISTS "OTP login só service role" ON basededados.login_otp_codes;
CREATE POLICY "OTP login só service role" ON basededados.login_otp_codes
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
