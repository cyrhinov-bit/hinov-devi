-- Migration: ajouter la colonne manquante 'members' sur la table services
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

ALTER TABLE services ADD COLUMN IF NOT EXISTS members INTEGER DEFAULT 1;

-- Vérification
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services';
