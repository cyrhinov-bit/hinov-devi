-- Migration: corrections de désynchronisations App <-> Supabase
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Ajouter colonne "unit" manquante dans prestations
ALTER TABLE prestations ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Jour';

-- 2. Ajouter colonne "status" et "company" manquantes dans clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Actif';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT;

-- 3. Ajouter colonnes manquantes dans settings (logo, TVA, validité)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS header_logo_base64 TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_vat NUMERIC DEFAULT 20;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_validity INTEGER DEFAULT 30;

-- Vérification
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('prestations', 'clients', 'settings')
ORDER BY table_name, ordinal_position;
