-- #3  Expiração automática de plano
-- #7  Limite de produtos/mês reforçado no servidor
--
-- Ambos idempotentes (CREATE OR REPLACE / ADD COLUMN IF NOT EXISTS).

-- ===========================================================================
-- #3  plan_expires_at
-- ===========================================================================
ALTER TABLE basededados.profiles  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;
ALTER TABLE basededados.companies ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- profiles.plan_expires_at é a FONTE DE VERDADE da expiração e é protegida
-- da mesma forma que role/plan: um UPDATE feito por um utilizador normal é
-- revertido; só o service_role (rotas de pagamento/aprovação) a muda.
-- (o trigger protect_privileged_profile_columns_trigger já existe e aponta
--  para esta função.)
CREATE OR REPLACE FUNCTION basededados.protect_privileged_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        NEW.role := OLD.role;
        NEW.plan := OLD.plan;
        NEW.plan_expires_at := OLD.plan_expires_at;
    END IF;
    RETURN NEW;
END;
$$;

-- ===========================================================================
-- #7  Limite de produtos por mês, aplicado na base de dados
-- ===========================================================================
-- Conta os produtos da empresa criados no mês corrente e recusa a inserção
-- acima do limite do plano. service_role e a equipa (admin/editor/
-- contribuidor) não são limitados. Plano expirado -> limite 0 (= Gratuito).
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

DROP TRIGGER IF EXISTS enforce_product_limit_trigger ON basededados.products;
CREATE TRIGGER enforce_product_limit_trigger
BEFORE INSERT ON basededados.products
FOR EACH ROW
EXECUTE FUNCTION basededados.enforce_product_limit();

NOTIFY pgrst, 'reload schema';
