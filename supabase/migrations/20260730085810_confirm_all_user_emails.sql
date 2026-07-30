-- Confirmer tous les emails des utilisateurs existants
-- L'app Hinov Devis utilise des codes PIN (pas de confirmation email nécessaire)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
