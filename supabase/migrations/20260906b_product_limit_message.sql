-- Só actualiza a mensagem de erro do limite de produtos: agora diz
-- explicitamente para fazer upgrade do plano (ou esperar pelo próximo mês).
-- O limite continua a ser POR MÊS DE CALENDÁRIO — reinicia sozinho no dia 1.
-- Idempotente (CREATE OR REPLACE).

CREATE OR REPLACE FUNCTION basededados.enforce_product_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = basededados, public
AS $$
DECLARE
    v_plan    text;
    v_owner   uuid;
    v_expired boolean := false;
    v_limit   int;
    v_count   int;
BEGIN
    IF auth.role() = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM basededados.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'editor', 'contribuidor')
    ) THEN
        RETURN NEW;
    END IF;

    SELECT plan, user_id INTO v_plan, v_owner
      FROM basededados.companies WHERE id = NEW.company_id;

    IF v_owner IS NOT NULL THEN
        SELECT (plan_expires_at IS NOT NULL AND plan_expires_at < now())
          INTO v_expired
          FROM basededados.profiles WHERE id = v_owner;
    END IF;

    v_limit := CASE
        WHEN COALESCE(v_expired, false) THEN 0
        WHEN lower(coalesce(v_plan, '')) IN ('parceiro', 'partner') THEN 2147483647
        WHEN lower(coalesce(v_plan, '')) IN ('business vendedor', 'business', 'vendedor', 'empresarial') THEN 10
        WHEN lower(coalesce(v_plan, '')) IN ('premium', 'profissional', 'professional') THEN 7
        WHEN lower(coalesce(v_plan, '')) IN ('básico', 'basico', 'basic') THEN 1
        ELSE 0
    END;

    SELECT count(*) INTO v_count
      FROM basededados.products
     WHERE company_id = NEW.company_id
       AND created_at >= date_trunc('month', now());

    IF v_count >= v_limit THEN
        RAISE EXCEPTION 'Atingiu o limite de % produto(s) deste mês no plano actual. Faça upgrade do plano para adicionar mais produtos, ou aguarde o início do próximo mês.', v_limit
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
