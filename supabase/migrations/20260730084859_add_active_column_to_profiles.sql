-- Ajouter la colonne "active" à la table profiles
-- Cette colonne est utilisée par l'application pour désactiver/activer les comptes utilisateurs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
